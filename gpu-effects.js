// A raymarched sculpture, spatial aperture, and image-slicing study.
// The procedural fields are original; no screenshots, DOM capture, or remote assets.
const vertexGL=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const fragmentGL=`#version 300 es
precision highp float;
uniform vec4 screen;
uniform vec4 control;
uniform sampler2D architecture;
uniform sampler2D material;
out vec4 outColor;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float shape(vec3 p,float phase,float mode,float t){
 p.xz=rot(phase*1.8+control.x*.35)*p.xz;
 p.xy=rot(-.4+phase*.7+control.y*.2)*p.xy;
 if(mode>2.5){
  float d=10.;
  for(int i=0;i<5;i++){
   vec3 q=p;q.x-=float(i-2)*(.09+phase*.34);
   q.yz=rot(float(i-2)*phase*.3)*q.yz;
   d=min(d,box(q,vec3(.045,.96,.48))-.025);
  }return d;
 }
 p.xz=rot(p.y*(.7+phase*.8)+t*.06)*p.xz;
 float ring=length(vec2(length(p.xy)-.82,p.z))-(.24+.07*sin(p.y*3.+phase*5.));
 float cut=box(p,vec3(.92,.92,.38))-.14;
 return mix(ring,cut,smoothstep(.58,1.,phase));
}
vec3 environment(vec3 r){
 vec3 base=mix(vec3(.09,.1,.16),vec3(.72,.78,.85),smoothstep(-.4,.8,r.y));
 float panel=pow(max(0.,dot(r,normalize(vec3(-1.5,1.,2.)))),12.);
 float strip=smoothstep(.88,.98,cos(r.x*5.+r.z*3.));
 base+=vec3(1.,.96,.83)*panel*1.8+vec3(.8,.87,1.)*strip*.65;
 base+=vec3(.6,.18,.08)*pow(max(0.,dot(r,normalize(vec3(2.,0.,1.)))),9.);
 return base;
}
void main(){
 vec2 uv=gl_FragCoord.xy/screen.xy;
 float phase=screen.w,mode=control.z,t=screen.z;
 vec2 aspect=vec2(screen.x/screen.y,1.);
 if(mode<.5||mode>2.5){
  vec2 center=mode>2.5?vec2(.34,.52):vec2(.64,.51);
  if(screen.x/screen.y<.8)center=mode>2.5?vec2(.5,.65):vec2(.5,.47);
  float scale=screen.x/screen.y<.8?5.2:3.2;
  vec2 p=(uv-center)*aspect*scale;
  vec3 ro=vec3(0.,0.,4.);vec3 rd=normalize(vec3(p,-3.5));
  float travel=0.,dist=0.;bool hit=false;
  for(int i=0;i<56;i++){vec3 pos=ro+rd*travel;dist=shape(pos,phase,mode,t);if(dist<.0018){hit=true;break;}travel+=dist*.85;if(travel>7.)break;}
  if(!hit){outColor=vec4(0.);return;}
  vec3 pos=ro+rd*travel;float e=.003;
  vec3 n=normalize(vec3(shape(pos+vec3(e,0,0),phase,mode,t)-shape(pos-vec3(e,0,0),phase,mode,t),shape(pos+vec3(0,e,0),phase,mode,t)-shape(pos-vec3(0,e,0),phase,mode,t),shape(pos+vec3(0,0,e),phase,mode,t)-shape(pos-vec3(0,0,e),phase,mode,t)));
  vec3 r=reflect(rd,n);float fresnel=pow(1.-max(dot(-rd,n),0.),3.);
  vec3 chrome=environment(r)*(.5+.5*max(n.y,0.));
  chrome+=vec3(.46,.5,.8)*fresnel*.4;
  chrome=chrome/(1.+chrome*.35);
  outColor=vec4(pow(chrome,vec3(.85)),control.w);return;
 }
 if(mode<1.5){
  vec2 p=(uv-.5)*aspect;
  float aperture=mix(.06,1.3,smoothstep(.03,.85,phase));
  float angle=atan(p.y,p.x);float edge=length(p)-aperture*(1.+.06*sin(angle*6.+phase*8.));
  float inside=1.-smoothstep(-.008,.008,edge);
  vec2 lens=.5+p/(1.+length(p)*(.8-phase*.4));
  vec2 shift=normalize(p+vec2(.001))*.007*exp(-abs(edge)*18.);
  vec3 image=vec3(texture(architecture,lens+shift).r,texture(architecture,lens).g,texture(architecture,lens-shift).b);
  float rim=exp(-abs(edge)*70.);
  vec3 color=image*inside+vec3(.75,.86,.95)*rim*.5;
  outColor=vec4(color,clamp(inside+rim*.8,0.,1.)*control.w);return;
 }
 // The image itself is sliced and displaced; typography remains a separate layer.
 float strip=floor(uv.x*22.);
 float local=smoothstep(.15,.85,fract(phase*3.));
 float stagger=smoothstep(0.,1.,local*1.65-fract(sin(strip*43.21)*41.7)*.65);
 float displacement=sin(stagger*3.14159)*(.18+.12*sin(strip*3.));
 vec2 a=uv+vec2(0.,displacement);
 vec2 b=uv-vec2(0.,(1.-stagger)*.35);
 vec3 first=texture(material,clamp(a,0.,1.)).rgb;
 vec3 second=texture(architecture,clamp(b,0.,1.)).rgb;
 vec3 image=mix(first,second,stagger);
 float seam=pow(1.-abs(fract(uv.x*22.)-.5)*2.,35.);
 image+=seam*sin(stagger*3.14159)*.14;
 outColor=vec4(image,control.w);
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
 const images=['architecture-study.jpg','material.jpg'];
 const textures=images.map((name,index)=>{
  const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([190,190,180,255]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const image=new Image();image.onload=()=>{if(gl.isContextLost())return;gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image)};image.src=import.meta.env.BASE_URL+'images/'+name;
  gl.uniform1i(gl.getUniformLocation(program,index===0?'architecture':'material'),index);return texture;
 });
 return {name:'webgl2',draw(data){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform4fv(screen,data.subarray(0,4));gl.uniform4fv(control,data.subarray(4));gl.drawArrays(gl.TRIANGLES,0,3)},dispose(){textures.forEach(t=>gl.deleteTexture(t));gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext()}};
}
export function createEffects(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let state={mode:0,progress:0,intensity:0},renderer,canvas,frame=0,last=0,stopped=false;
 let pointer=[.5,.5],target=[.5,.5];const data=new Float32Array(8);
 const coarse=matchMedia('(pointer: coarse)').matches;
 const setScene=(next)=>{state=next;if(canvas){if(next.host&&canvas.parentElement!==next.host)next.host.prepend(canvas);canvas.hidden=next.intensity<=.001;}if(next.intensity>.001)start();};
 function size(){if(!canvas)return;const scale=Math.min(devicePixelRatio,1.25,Math.sqrt((coarse?230000:480000)/(innerWidth*innerHeight)));canvas.width=Math.max(1,Math.round(innerWidth*scale));canvas.height=Math.max(1,Math.round(innerHeight*scale));}
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
  (state.host||document.querySelector('.intro .scene-viewport')||document.body).prepend(canvas);document.documentElement.dataset.effects=renderer.name;size();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});
  window.addEventListener('resize',size);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start()});
  window.addEventListener('pointermove',e=>{target=[e.clientX/innerWidth,1-e.clientY/innerHeight]},{passive:true});
  start();
 }
 init();return {setScene};
}
