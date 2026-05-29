// Minimal OutputShader — tone mapping + sRGB transfer for OutputPass
const OutputShader = {
	name: 'OutputShader',
	uniforms: {
		tDiffuse: { value: null },
		toneMappingExposure: { value: 1.0 },
	},
	vertexShader: `
		precision mediump float;
		attribute vec3 position;
		attribute vec2 uv;
		varying vec2 vUv;
		void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
	`,
	fragmentShader: `
		precision mediump float;
		uniform sampler2D tDiffuse;
		uniform float toneMappingExposure;
		varying vec2 vUv;
		vec3 acesFilmic(vec3 c) {
			c *= toneMappingExposure;
			const mat3 m1 = mat3(0.59719,0.07600,0.02840,0.35458,0.90834,0.13383,0.04823,0.01566,0.83777);
			const mat3 m2 = mat3(1.60475,-0.10208,-0.00327,-0.53108,1.10813,-0.07276,-0.07367,-0.00605,1.07602);
			vec3 v = m1 * c;
			vec3 a = v*(v+0.0245786)-0.000090537;
			vec3 b = v*(0.983729*v+0.4329510)+0.238081;
			return clamp(m2*(a/b), 0.0, 1.0);
		}
		vec3 srgb(vec3 v) {
			return mix(v*12.92, 1.055*pow(clamp(v,0.0,1.0),vec3(1.0/2.4))-0.055, step(vec3(0.0031308),v));
		}
		void main() {
			vec4 t = texture2D(tDiffuse, vUv);
			vec3 c = t.rgb;
			#ifdef ACES_FILMIC_TONE_MAPPING
				c = acesFilmic(c);
			#else
				c = clamp(c * toneMappingExposure, 0.0, 1.0);
			#endif
			#ifdef SRGB_TRANSFER
				c = srgb(c);
			#endif
			gl_FragColor = vec4(c, t.a);
		}
	`,
};
export { OutputShader };
