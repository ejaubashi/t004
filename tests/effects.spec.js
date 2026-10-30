import {test,expect} from '@playwright/test';
test.use({launchOptions:{executablePath:'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']}});
const modes=[['.word-stage',.45],['.values-scene',.56/3],['.engineering',.55],['.services',.125]];
async function exercise(page){
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://localhost:5173');
 for(const [selector,p] of modes){await page.evaluate(({selector,p})=>{document.documentElement.style.scrollBehavior='auto';const el=document.querySelector(selector);scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*p)},{selector,p});await expect(page.locator('.gpu-effects')).toBeVisible();}
 await page.waitForTimeout(250);expect(errors).toEqual([]);
}
test.describe('WebGL2 and graceful fallback',()=>{
 test.beforeEach(async({page})=>{await page.addInitScript(()=>Object.defineProperty(navigator,'gpu',{value:undefined}));});
 test('renders all shader modes and survives context loss',async({page})=>{await exercise(page);await expect(page.locator('html')).toHaveAttribute('data-effects','webgl2');await page.locator('.gpu-effects').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await expect(page.locator('html')).toHaveAttribute('data-effects','css');await expect(page.locator('.gpu-effects')).toHaveCount(0);await page.getByRole('tab',{name:'Interior',exact:true}).click();await expect(page.locator('#service-description')).toContainText('Interiors');});
 test('keeps content usable when no GPU is available',async({page})=>{await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args)}});await page.goto('http://localhost:5173');await expect(page.locator('html')).toHaveAttribute('data-effects','css');await expect(page.locator('h1')).toContainText('Architecture');await page.getByRole('button',{name:'Load more'}).click();await expect(page.locator('.project-card')).toHaveCount(9);});
 test('does not allocate a canvas for reduced motion',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://localhost:5173');await expect(page.locator('html')).toHaveAttribute('data-effects','reduced');await expect(page.locator('.gpu-effects')).toHaveCount(0);});
});
