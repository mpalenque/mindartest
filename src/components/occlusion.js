/*
  A-Frame Occlusion Component
  Makes an object invisible but still updates the depth buffer, 
  allowing it to hide other objects behind it.
*/
AFRAME.registerComponent('occlusion', {
  init: function () {
    const mesh = this.el.getObject3D('mesh');
    if (mesh) {
      this.applyOcclusion(mesh);
    } else {
      this.el.addEventListener('model-loaded', () => {
        this.applyOcclusion(this.el.getObject3D('mesh'));
      });
    }
  },

  applyOcclusion: function (obj) {
    if (!obj) return;
    obj.traverse((node) => {
      if (node.isMesh) {
        node.material.colorWrite = false;
      }
    });
  }
});
