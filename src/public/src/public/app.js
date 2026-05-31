document.addEventListener('DOMContentLoaded', () => {
  const configPanel = document.getElementById('config-panel');
  const processingPanel = document.getElementById('processing-panel');
  const resultsPanel = document.getElementById('results-panel');
  const storyInput = document.getElementById('story-input');
  const genreInput = document.getElementById('genre-input');
  const durationInput = document.getElementById('duration-input');
  const generateBtn = document.getElementById('generate-btn');
  const autoScriptBtn = document.getElementById('auto-script-btn');
  const restartBtn = document.getElementById('restart-btn');
  const statusHeadline = document.getElementById('status-headline');
  const statusSubtext = document.getElementById('status-subtext');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressPercentageText = document.getElementById('progress-percentage-text');
  const downloadLink1080p = document.getElementById('download-link-1080p');

  let activePollingInterval = null;
  const mockScripts = [
    "A legendary level 99 Necromancer wakes up trapped inside the body of an F-Rank academy student who was just exiled from his noble guild family.",
    "The absolute ruler of the demonic Murim sect breaks through reality constructs, only to find himself in modern Seoul where dungeons are breaking open."
  ];

  autoScriptBtn.addEventListener('click', (e) => {
    e.preventDefault();
    storyInput.value = mockScripts[Math.floor(Math.random() * mockScripts.length)];
  });

  generateBtn.addEventListener('click', async () => {
    const rawStory = storyInput.value.trim();
    if (!rawStory) return alert('Please enter a story idea or click Auto-Generate.');

    configPanel.classList.add('hidden');
    processingPanel.classList.remove('hidden');
    updateProgress(0, 'Initializing server engine...', 'Queueing task...');

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: rawStory, genre: genreInput.value, duration: durationInput.value })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Server error.');
      
      startTracking(data.jobId);
    } catch (err) {
      alert(`Initialization failed: ${err.message}`);
      resetUI();
    }
  });

  function startTracking(jobId) {
    activePollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video/status/${jobId}`);
        if (!response.ok) return;
        const data = await response.json();
        
        updateProgress(data.progress, data.stage, `Job ID: ${jobId}`);

        if (data.status === 'completed') {
          clearInterval(activePollingInterval);
          processingPanel.classList.add('hidden');
          resultsPanel.classList.remove('hidden');
          downloadLink1080p.href = `/api/video/download/${jobId}`;
        } else if (data.status === 'failed') {
          clearInterval(activePollingInterval);
          alert(`Error: ${data.stage}`);
          resetUI();
        }
      } catch (err) { console.error(err); }
    }, 1500);
  }

  function updateProgress(percentage, stage, subtext) {
    progressBarFill.style.width = `${percentage}%`;
    progressPercentageText.innerText = `${percentage}%`;
    statusHeadline.innerText = stage;
    statusSubtext.innerText = subtext;
  }

  function resetUI() {
    if (activePollingInterval) clearInterval(activePollingInterval);
    processingPanel.classList.add('hidden');
    resultsPanel.classList.add('hidden');
    configPanel.classList.remove('hidden');
  }

  restartBtn.addEventListener('click', resetUI);
});
