/** The single source of scroll truth shared between the scroll director and
 * the render loop (build spec §3). */
export const state = {
  sceneId: 1,
  progress: 0,
  pointerX: 0,
  ready: false,
};
