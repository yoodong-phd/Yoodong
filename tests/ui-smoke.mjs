import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const out='.local/ui-smoke';await fs.mkdir(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const page=await browser.newPage();
const health=await page.goto('http://127.0.0.1:4174/api/me');
assert.equal(health.status(),200,'Start the local development server on port 4174');
const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));page.on('dialog',d=>d.accept());
const checks=[];const pass=x=>{checks.push(x);console.log('PASS',x)};
async function click(selector){await page.waitForSelector(selector);await page.$eval(selector,e=>e.scrollIntoView({block:'center',inline:'center'}));await page.click(selector);}
async function screenshot(name,fullPage=true){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+'/'+name+'.png',fullPage});}
async function noOverflow(label){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' horizontal overflow');}
try{
await page.setViewport({width:1440,height:1000});await page.goto('http://127.0.0.1:4174',{waitUntil:'networkidle0'});await screenshot('login-desktop');
await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.matches('button,a,input')));pass('Login controls reachable by keyboard');
for(const width of [320,375,390,768,1280,1920]){await page.setViewport({width,height:900});await noOverflow('login '+width);}
pass('Login responsive at 320–1920px');await page.setViewport({width:390,height:844});await screenshot('login-mobile');
await click('[data-guest]');await page.waitForSelector('[data-lesson]');
for(const width of [320,375,390,768,1280,1920]){await page.setViewport({width,height:900});await noOverflow('home '+width);}
pass('Home responsive at 320–1920px');await page.setViewport({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await screenshot('home-desktop',false);await screenshot('home-full');
await page.setViewport({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await screenshot('home-mobile',false);await screenshot('home-mobile-full');
assert.equal(await page.$$eval('.quest-bottom [data-nav]',els=>els.length),5);assert.equal(await page.$$eval('[data-mode]',els=>els.length),7);pass('All five student destinations and seven study modes preserved');
await click('.continue-learning [data-start]');await page.waitForSelector('[data-option]');await click('[data-option="0"]');await click('[data-check]');await page.waitForSelector('.feedback');await screenshot('quiz-mobile');pass('Guest quiz selection, grading and explanation');
await click('[data-nav="learn"]');await page.waitForSelector('[data-chapter]');await click('[data-chapter]:nth-child(2)');assert((await page.$eval('.chapter-summary h2',e=>e.textContent)).includes('Chapter 2'));pass('Chapter switching');
await click('[data-nav="review"]');await page.waitForSelector('h1');await screenshot('review-mobile');await noOverflow('review');await click('[data-nav="progress"]');await page.waitForSelector('.grid-stats');await noOverflow('progress');pass('Review and progress destinations');
await page.setViewport({width:1440,height:1000});await click('[data-nav="anatomy"]');await page.waitForSelector('[data-graphics="ready"]',{timeout:60000});assert.equal(await page.$eval('[data-mesh-count]',e=>e.dataset.meshCount),'177');pass('3D model loads all 177 meshes');
await page.type('#muscle-search','biceps');await page.waitForFunction(()=>document.querySelectorAll('[data-muscle]').length>0);await click('[data-muscle]');assert((await page.$eval('#muscle-detail',e=>e.textContent)).length>150);await screenshot('atlas-desktop',false);pass('Muscle search, selection and learning card');
await click('[data-camera="back"]');await click('[data-focus]');await click('#atlas-isolate');await click('[data-reset]');assert.equal(await page.$eval('#atlas-isolate',e=>e.checked),false);await page.setViewport({width:390,height:844});await noOverflow('atlas mobile');await screenshot('atlas-mobile');pass('3D views, focus, isolate, reset and mobile layout');
await click('[data-logout]');await page.waitForSelector('#auth-form');await click('[data-switch-auth]');await page.waitForSelector('#auth-confirm');
const studentNo='qa'+Date.now();const password='AnatomyQA!2026';await page.type('#auth-name','UI 검증');await page.type('#auth-student-no',studentNo);await page.type('#auth-password',password);await page.type('#auth-confirm',password);await click('.auth-submit');await page.waitForSelector('.continue-learning');pass('Student registration against local API');
await click('.continue-learning [data-start]');let answerCount=0;
while(!await page.$('[data-finish]')){if(++answerCount>10)throw Error('Quiz loop did not finish');await page.waitForSelector('[data-option]');await click('[data-option="0"]');await click('[data-check]');await page.waitForSelector('.feedback');await click('[data-check]');await page.waitForFunction(()=>document.querySelector('[data-finish]')||!document.querySelector('.feedback'));}
await screenshot('lesson-result');await click('[data-finish]');await click('[data-nav="progress"]');assert((await page.$eval('.grid-stats',e=>e.textContent)).includes('5문항'));await page.reload({waitUntil:'networkidle0'});await page.waitForSelector('[data-nav="progress"]');await click('[data-nav="progress"]');assert((await page.$eval('.grid-stats',e=>e.textContent)).includes('5문항'));pass('Full student lesson, server grading and persisted progress after reload');
await click('[data-logout]');await page.waitForSelector('#auth-form');await page.type('#auth-name',studentNo);await page.type('#auth-password',password);await click('.auth-submit');await page.waitForSelector('.continue-learning');pass('Student login after logout');await click('[data-logout]');await click('[data-auth-tab="admin"]');await click('[data-admin-login]');await page.waitForSelector('[data-nav="admin"]');await page.setViewport({width:1440,height:1000});await click('[data-nav="admin"]');await page.waitForSelector('.students-table');await screenshot('professor-desktop');assert((await page.$eval('.students-table',e=>e.textContent)).includes(studentNo));pass('Professor login and real student progress table');
await click('[data-nav="manage"]');await page.waitForSelector('[data-add-chapter]');await click('[data-add-chapter]');await page.waitForSelector('dialog[open]');await screenshot('professor-dialog');await noOverflow('professor dialog');await click('[data-close-dialog]');pass('Question bank and chapter editor dialog');
await page.setViewport({width:390,height:844});await noOverflow('professor mobile');await screenshot('professor-mobile');
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);pass('No uncaught browser errors or failed network requests');
await fs.writeFile(out+'/report.json',JSON.stringify({checks,errors,failed,studentNo},null,2));
}finally{await browser.close();}
