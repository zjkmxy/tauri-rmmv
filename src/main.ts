// PluginManager.setup($plugins);

import { Scene_Boot } from './rpg/scenes/Scene_Boot';
import * as SceneManager from './rpg/managers/SceneManager';

window.addEventListener('DOMContentLoaded', () => {
  SceneManager.run(Scene_Boot);
});
