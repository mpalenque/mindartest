/* 
  A-Frame Chroma Key Shader Component
  Removes a specific color (usually green) from a video/image material.
*/
AFRAME.registerComponent('chromakey', {
  schema: {
    color: { type: 'color', default: '#00FF00' },
    threshold: { type: 'number', default: 0.1 },
    smoothness: { type: 'number', default: 0.05 }
  },

  init: function () {
    this.material = null;
    this.sourceMap = null;

    this.applyShader = this.applyShader.bind(this);
    this.el.addEventListener('object3dset', this.applyShader);
    this.el.addEventListener('materialtextureloaded', this.applyShader);
    this.applyShader();
  },

  applyShader: function () {
    const mesh = this.el.getObject3D('mesh');
    if (!mesh || this.material) return;

    const sourceMaterial = this.el.components.material && this.el.components.material.material;
    if (sourceMaterial && sourceMaterial.map) {
      this.sourceMap = sourceMaterial.map;
    }

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tex: { type: 't', value: this.sourceMap },
        color: { type: 'c', value: new THREE.Color(this.data.color) },
        threshold: { type: 'f', value: this.data.threshold },
        smoothness: { type: 'f', value: this.data.smoothness }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tex;
        uniform vec3 color;
        uniform float threshold;
        uniform float smoothness;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(tex, vUv);
          float diff = distance(texColor.rgb, color);
          float alpha = smoothstep(threshold, threshold + smoothness, diff);
          gl_FragColor = vec4(texColor.rgb, alpha);
        }
      `,
      transparent: true
    });

    mesh.material = this.material;
  },

  tick: function () {
    const sourceMaterial = this.el.components.material && this.el.components.material.material;
    if (this.material && sourceMaterial && sourceMaterial.map) {
      this.material.uniforms.tex.value = sourceMaterial.map;
    }
  },

  update: function () {
    if (!this.material) return;
    this.material.uniforms.color.value.set(this.data.color);
    this.material.uniforms.threshold.value = this.data.threshold;
    this.material.uniforms.smoothness.value = this.data.smoothness;
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.applyShader);
    this.el.removeEventListener('materialtextureloaded', this.applyShader);
    if (this.material) this.material.dispose();
  }
});
