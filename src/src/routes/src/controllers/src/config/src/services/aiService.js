exports.expandStoryToManhwaScript = async (shortStory, genre, targetedDurationMinutes) => {
  const targetedSeconds = targetedDurationMinutes * 60;
  const standardSceneDurationSeconds = 5; 
  const validationSceneCount = Math.ceil(targetedSeconds / standardSceneDurationSeconds);

  const scriptScenes = [];
  for (let i = 1; i <= validationSceneCount; i++) {
    scriptScenes.push({
      sceneId: i,
      narration: `Scene ${i} of our epic ${genre} saga.`,
      promptStyle: `Manhwa artwork style, detailed scene ${i}`
    });
  }
  return scriptScenes;
};
