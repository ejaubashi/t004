// One full-screen triangle with original WebGL2 procedural shaders.
// The procedural fields are original; no screenshots, DOM capture, or remote assets.
const vertexGL=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const fragmentGL=`#version 300 es
precision highp float;
uniform vec4 screen; // width, height, time, progress
uniform vec4 control; // pointer x/y, mode, intensity
out vec4 outColor;
float field(vec2 p,float t){
  p+=.18*vec2(sin(p.y*2.7+t*.3),cos(p.x*3.1-t*.25));
  return sin(p.x*3.+p.y*2.+t*.22)+.5*sin(p.y*5.-p.x*2.-t*.3)+.25*cos(p.x*9.+p.y*4.+t*.16);
}
void main(){
  vec2 uv=gl_FragCoord.xy/screen.xy;
  vec2 p=(uv-.5)*vec2(screen.x/screen.y,1.);
  vec2 pointer=(control.xy-.5)*vec2(screen.x/screen.y,1.);
  float t=screen.z,progress=screen.w,mode=control.z;
  float d=length(p-pointer),ripple=sin(d*18.-t*1.5)*exp(-d*3.);
  float f=field(p+vec2(ripple*.08),t);
  vec3 color=vec3(0.);float alpha=0.;
  if(mode<.5){
    float lines=pow(.5+.5*sin(f*8.+progress*7.),14.);
    float halo=exp(-abs(f)*2.5)*.22;
    color=.55+.45*cos(vec3(0.,2.1,4.2)+f*2.+t*.12+progress*5.);
    alpha=(lines*.29+halo+exp(-d*6.)*.18)*control.w;
  }else if(mode<1.5){
    float wave=uv.x+uv.y*.25+f*.055;
    float edge=1.-abs(wave-(progress*1.8-.3));
    float band=pow(max(0.,edge),28.);
    float split=pow(max(0.,1.-abs(wave-(progress*1.8-.28))),45.);
    color=.55+.45*cos(vec3(0.,2.,4.)+(wave-progress)*18.);
    alpha=(band*.7+split*.25)*control.w;
  }else{
    float scan=exp(-abs(uv.y-fract(progress*1.4+t*.035))*70.);
    vec2 grid=abs(fract((p+vec2(0.,progress*.05))*vec2(22.,34.))-.5);
    float dots=(1.-smoothstep(.015,.035,length(grid)))*.2;
    float center=exp(-length((uv-vec2(.35,.5))*vec2(2.,1.))*2.);
    color=mix(vec3(.2,.9,1.),vec3(.9,.4,1.),uv.x);
    alpha=(scan*.55+dots)*center*control.w;
  }
  float vignette=1.-smoothstep(.3,.95,length(uv-.5));
  outColor=vec4(color,clamp(alpha*vignette,0.,.6));
}`;
function makeCanvas(){const canvas=document.createElement('canvas');canvas.className='gpu-effects';canvas.setAttribute('aria-hidden','true');return canvas;}
function webgl(canvas){
 const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
 if(!gl)return null;
 const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Effect shader compilation failed')}return shader};
 const vs=compile(gl.VERTEX_SHADER,vertexGL),fs=compile(gl.FRAGMENT_SHADER,fragmentGL);
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return null;}
 const screen=gl.getUniformLocation(program,'screen'),control=gl.getUniformLocation(program,'control');
 gl.useProgram(program);
 return {name:'webgl2',draw(data){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform4fv(screen,data.subarray(0,4));gl.uniform4fv(control,data.subarray(4));gl.drawArrays(gl.TRIANGLES,0,3)},dispose(){gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}};
}
export function createEffects(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let state={mode:0,progress:0,intensity:0},renderer,canvas,frame=0,last=0,stopped=false;
 let pointer=[.5,.5],target=[.5,.5];const data=new Float32Array(8);
 const coarse=matchMedia('(pointer: coarse)').matches;
 const setScene=(next)=>{state=next;if(canvas){canvas.style.clipPath=`inset(${next.top||0}px 0 ${next.bottom||0}px)`;canvas.hidden=next.intensity<=.001;}if(next.intensity>.001)start();};
 function size(){if(!canvas)return;const scale=Math.min(devicePixelRatio,1.25,Math.sqrt((coarse?650000:1400000)/(innerWidth*innerHeight)));canvas.width=Math.max(1,Math.round(innerWidth*scale));canvas.height=Math.max(1,Math.round(innerHeight*scale));}
 function start(){if(renderer&&!frame&&!document.hidden&&!stopped)frame=requestAnimationFrame(draw)}
 function draw(time){frame=0;if(document.hidden||stopped||state.intensity<=.001)return;if(time-last<(coarse?32:16)){start();return;}last=time;
 pointer=pointer.map((v,i)=>v+(target[i]-v)*.08);
 data.set([canvas.width,canvas.height,time*.001,state.progress,pointer[0],pointer[1],state.mode,state.intensity]);
 try{renderer.draw(data)}catch{fallback();return;}start();
 }
 function fallback(){if(stopped)return;stopped=true;cancelAnimationFrame(frame);frame=0;if(canvas)canvas.remove();renderer?.dispose();document.documentElement.dataset.effects='css';}
 function init(){
  if(reduced.matches){document.documentElement.dataset.effects='reduced';return;}
  canvas=makeCanvas();
  try{renderer=webgl(canvas)}catch{renderer=null;}
  if(!renderer){fallback();return;}
  // Preference may change while the adapter is initializing.
  if(reduced.matches){renderer.dispose();return;}
  document.body.append(canvas);document.documentElement.dataset.effects=renderer.name;size();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});
  window.addEventListener('resize',size);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start()});
  window.addEventListener('pointermove',e=>{target=[e.clientX/innerWidth,1-e.clientY/innerHeight]},{passive:true});
  start();
 }
 init();return {setScene};
}
