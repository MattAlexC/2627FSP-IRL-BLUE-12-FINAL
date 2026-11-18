// 1. Set exact 0.5x playback speed for hero background video
    const heroVideo = document.getElementById('heroVideo');
    heroVideo.playbackRate = 0.5;

    // 1b. Page-specific music. Both tracks ship with the project.
    // Browsers can reject autoplay before the first click, so offer a button
    // and retry after real pointer/keyboard input without altering preferences.
    const menuMusic = document.getElementById('menuMusic');
    const gameMusic = document.getElementById('gameMusic');
    const MUSIC_PREF_KEY = 'sonions.music.enabled.v1';
    const MASTER_VOLUME = 0.32;
    let musicEnabled = true;
    try { musicEnabled = localStorage.getItem(MUSIC_PREF_KEY) !== 'false'; } catch (_) {}
    let musicIsPlaying = false;
    let musicFadeFrame = 0;
    let musicFadeVersion = 0;
    let musicScene = 'landing';
    menuMusic.volume = 0;
    gameMusic.volume = 0;

    function updateMusicButtons() {
      document.querySelectorAll('.music-toggle').forEach(button => {
        const status = !musicEnabled ? 'Music off' : (musicIsPlaying ? 'Music on' : 'Enable music');
        button.querySelector('.music-status').textContent = status;
        button.setAttribute('aria-label', !musicEnabled ? 'Turn background music on' : (musicIsPlaying ? 'Turn background music off' : 'Enable background music'));
        button.setAttribute('aria-pressed', String(musicEnabled && musicIsPlaying));
        button.classList.toggle('music-off', !musicEnabled);
        button.classList.toggle('music-on', musicEnabled && musicIsPlaying);
        button.title = status;
      });
    }

    function switchMusic(scene, duration = 980) {
      musicScene = scene;
      cancelAnimationFrame(musicFadeFrame);
      const version = ++musicFadeVersion;
      if (!musicEnabled) {
        menuMusic.pause(); gameMusic.pause();
        menuMusic.volume = 0; gameMusic.volume = 0;
        musicIsPlaying = false;
        updateMusicButtons();
        return;
      }
      const incoming = scene === 'game' ? gameMusic : menuMusic;
      const outgoing = incoming === menuMusic ? gameMusic : menuMusic;
      const startIncoming = incoming.volume;
      const startOutgoing = outgoing.volume;
      const startedAt = performance.now();
      // Start within the same user gesture when called by navigation.
      const playAttempt = incoming.play();
      if (playAttempt && typeof playAttempt.then === 'function') {
        playAttempt.then(() => {
          if (version !== musicFadeVersion) return;
          musicIsPlaying = true;
          updateMusicButtons();
        }).catch(() => {
          if (version !== musicFadeVersion) return;
          musicIsPlaying = false;
          updateMusicButtons();
        });
      }
      function animateFade(now) {
        if (version !== musicFadeVersion) return;
        const p = Math.min(1, (now - startedAt) / duration);
        const eased = p * p * (3 - 2*p);
        incoming.volume = Math.min(1, Math.max(0, startIncoming + (MASTER_VOLUME-startIncoming)*eased));
        outgoing.volume = Math.min(1, Math.max(0, startOutgoing*(1-eased)));
        if (p < 1) musicFadeFrame = requestAnimationFrame(animateFade);
        else { outgoing.pause(); outgoing.volume = 0; }
      }
      musicFadeFrame = requestAnimationFrame(animateFade);
    }

    function toggleMusic() {
      // First explicit press is an enable action if autoplay was blocked.
      if (musicEnabled && !musicIsPlaying) {
        switchMusic(musicScene, 480);
        return;
      }
      musicEnabled = !musicEnabled;
      try { localStorage.setItem(MUSIC_PREF_KEY, String(musicEnabled)); } catch (_) {}
      switchMusic(musicScene, 480);
    }

    function maybeUnlockAudio(event) {
      if (!musicEnabled || musicIsPlaying) return;
      // The dedicated toggle manages its own click and must not double-toggle.
      if (event.target && event.target.closest && event.target.closest('.music-toggle')) return;
      switchMusic(musicScene, 500);
    }
    document.addEventListener('pointerdown', maybeUnlockAudio, {capture:true, passive:true});
    document.addEventListener('keydown', maybeUnlockAudio, {capture:true});
    updateMusicButtons();
    // Attempt ambient menu playback immediately; on most browsers it begins
    // after the first interaction because audible autoplay is restricted.
    switchMusic('landing', 1100);

    // 2. Slowed-Down Sparkling Stars & Tiny Meteorite Dots Canvas
    const spaceCanvas = document.getElementById('spaceCanvas');
    const spaceCtx = spaceCanvas.getContext('2d');
    let stars = [];
    let meteorites = [];

    function resizeSpaceCanvas() {
      spaceCanvas.width = window.innerWidth;
      spaceCanvas.height = window.innerHeight;
    }

    function initSpaceScene() {
      resizeSpaceCanvas();
      stars = Array.from({ length: 130 }, () => ({
        x: Math.random() * spaceCanvas.width,
        y: Math.random() * spaceCanvas.height,
        radius: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.55 + 0.15,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.04,
        driftY: (Math.random() - 0.5) * 0.04
      }));

      meteorites = Array.from({ length: 9 }, () => createMeteorite(true));
    }

    function createMeteorite(randomStart = false) {
      const fromTop = Math.random() > 0.35;
      return {
        x: randomStart
          ? Math.random() * spaceCanvas.width
          : (fromTop ? Math.random() * spaceCanvas.width * 1.2 : spaceCanvas.width + 20),
        y: randomStart
          ? Math.random() * spaceCanvas.height
          : (fromTop ? -20 : Math.random() * spaceCanvas.height * 0.6),
        vx: -(Math.random() * 0.55 + 0.25), // Slowed-down drift
        vy: Math.random() * 0.45 + 0.2,
        size: Math.random() * 1.2 + 0.7,
        tailLength: Math.random() * 28 + 14,
        alpha: Math.random() * 0.5 + 0.25
      };
    }

    function animateSpace() {
      spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);

      // Draw sparkling stars
      for (const s of stars) {
        s.phase += s.twinkleSpeed;
        s.x += s.driftX;
        s.y += s.driftY;

        if (s.x < 0) s.x = spaceCanvas.width;
        if (s.x > spaceCanvas.width) s.x = 0;
        if (s.y < 0) s.y = spaceCanvas.height;
        if (s.y > spaceCanvas.height) s.y = 0;

        const sparkle = Math.max(0, Math.sin(s.phase));
        const alpha = s.baseAlpha + sparkle * 0.45;

        spaceCtx.beginPath();
        spaceCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        spaceCtx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        spaceCtx.fill();

        // Subtle cross-glint on occasional bright sparkles
        if (sparkle > 0.94 && s.radius > 1.1) {
          spaceCtx.strokeStyle = `rgba(255, 255, 255, ${(sparkle * 0.35).toFixed(3)})`;
          spaceCtx.lineWidth = 0.6;
          spaceCtx.beginPath();
          spaceCtx.moveTo(s.x - 4, s.y);
          spaceCtx.lineTo(s.x + 4, s.y);
          spaceCtx.moveTo(s.x, s.y - 4);
          spaceCtx.lineTo(s.x, s.y + 4);
          spaceCtx.stroke();
        }
      }

      // Draw tiny white meteorite dots gliding across
      for (let i = 0; i < meteorites.length; i++) {
        const m = meteorites[i];
        m.x += m.vx;
        m.y += m.vy;

        const grad = spaceCtx.createLinearGradient(
          m.x, m.y,
          m.x - m.vx * m.tailLength, m.y - m.vy * m.tailLength
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        spaceCtx.strokeStyle = grad;
        spaceCtx.lineWidth = m.size;
        spaceCtx.beginPath();
        spaceCtx.moveTo(m.x, m.y);
        spaceCtx.lineTo(m.x - m.vx * m.tailLength, m.y - m.vy * m.tailLength);
        spaceCtx.stroke();

        // Glowing white dot head
        spaceCtx.beginPath();
        spaceCtx.arc(m.x, m.y, m.size * 0.9, 0, Math.PI * 2);
        spaceCtx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, m.alpha + 0.3)})`;
        spaceCtx.fill();

        if (m.x < -50 || m.y > spaceCanvas.height + 50) {
          meteorites[i] = createMeteorite(false);
        }
      }

      requestAnimationFrame(animateSpace);
    }

    initSpaceScene();
    animateSpace();
    window.addEventListener('resize', resizeSpaceCanvas);

    // 3. Light-Speed Hyperspace Warp Transition Effect
    const warpCanvas = document.getElementById('warpCanvas');
    const warpCtx = warpCanvas.getContext('2d');
    let isTransitioning = false;

    function playWarpEffect(duration = 950) {
      warpCanvas.width = window.innerWidth;
      warpCanvas.height = window.innerHeight;
      warpCanvas.classList.add('active');

      const cx = warpCanvas.width / 2;
      const cy = warpCanvas.height / 2;
      const maxDist = Math.hypot(cx, cy);

      const streaks = Array.from({ length: 160 }, () => {
        const angle = Math.random() * Math.PI * 2;
        return {
          angle,
          dist: Math.random() * maxDist * 0.45 + 20,
          speed: Math.random() * 14 + 8,
          thickness: Math.random() * 1.6 + 0.4,
          alpha: Math.random() * 0.75 + 0.25
        };
      });

      const startTime = performance.now();

      function renderWarp(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Exponential acceleration curve toward speed of light
        const accel = Math.pow(progress, 2.2) * 45 + 2;

        warpCtx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        warpCtx.fillRect(0, 0, warpCanvas.width, warpCanvas.height);

        // Radial edge-warping vignette streaks
        for (const st of streaks) {
          const prevDist = st.dist;
          st.dist += st.speed * accel * 0.14;

          const x1 = cx + Math.cos(st.angle) * prevDist;
          const y1 = cy + Math.sin(st.angle) * prevDist;
          const x2 = cx + Math.cos(st.angle) * st.dist;
          const y2 = cy + Math.sin(st.angle) * st.dist;

          // Brighter and more stretched near the outer edges of the screen
          const edgeFactor = Math.min(1, st.dist / (maxDist * 0.75));
          const lineAlpha = st.alpha * edgeFactor * (1 - Math.pow(progress, 4));

          warpCtx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha.toFixed(3)})`;
          warpCtx.lineWidth = st.thickness * (1 + edgeFactor * 1.5);
          warpCtx.beginPath();
          warpCtx.moveTo(x1, y1);
          warpCtx.lineTo(x2, y2);
          warpCtx.stroke();

          if (st.dist > maxDist * 1.2) {
            st.dist = Math.random() * 60 + 15;
          }
        }

        if (progress < 1) {
          requestAnimationFrame(renderWarp);
        } else {
          warpCtx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);
          warpCanvas.classList.remove('active');
        }
      }

      requestAnimationFrame(renderWarp);
    }

    // 4. Scene navigation: the nav exits upward, and the play form exits downward.
    let currentScene = 'landing';
    const holeBackdrop = document.querySelector('.black-hole-fallback');
    const scenes = {
      landing: document.getElementById('landingView'),
      creators: document.getElementById('creatorsView'),
      game: document.getElementById('gameView')
    };

    function navigateTo(nextScene) {
      if (isTransitioning || nextScene === currentScene) return;
      isTransitioning = true;
      // Crossfade music to the destination's soundtrack during the warp.
      switchMusic(nextScene, 1080);
      const previous = currentScene;
      const from = scenes[previous];
      const to = scenes[nextScene];

      // Fly straight into the backdrop's black hole when entering the game.
      if (previous === 'landing') {
        heroVideo.classList.add(nextScene === 'game' ? 'video-falling-in' : 'video-warping');
        holeBackdrop.classList.add(nextScene === 'game' ? 'hole-falling-in' : 'hole-warping');
      }
      from.classList.add('scene-exiting');
      if (previous === 'creators') spaceCanvas.classList.remove('active');
      playWarpEffect(1080);

      setTimeout(() => {
        from.classList.add('view-hidden');
        from.classList.remove('scene-exiting');
        heroVideo.classList.remove('video-warping', 'video-falling-in');
        heroVideo.classList.toggle('video-hidden', nextScene !== 'landing');
        holeBackdrop.classList.remove('hole-falling-in', 'hole-warping');
        holeBackdrop.classList.toggle('hole-hidden',nextScene !== 'landing');
        if (nextScene === 'creators') spaceCanvas.classList.add('active');
        else spaceCanvas.classList.remove('active');

        to.classList.remove('view-hidden');
        to.classList.add('warping-in', 'scene-arriving');
        currentScene = nextScene;
        if (nextScene === 'game') {
          enterGameScene();
        }

        setTimeout(() => {
          to.classList.remove('warping-in', 'scene-arriving');
          isTransitioning = false;
        }, 740);
      }, 720);
    }

    function transitionToCreators() { navigateTo('creators'); }
    function transitionToLanding() { navigateTo('landing'); }
    function transitionToGame() {
      const input = document.getElementById('nicknameInput');
      const chosen = input.value.trim().replace(/\s+/g, ' ').slice(0,24);
      if (!chosen) { input.focus(); input.setCustomValidity('Please enter your nickname.'); input.reportValidity(); return; }
      input.setCustomValidity('');
      gameState.nickname = chosen;
      saveGame();
      navigateTo('game');
    }

    // 5. Switch Between Matthew, Jovian, and Justin CVs
    function selectCreator(creatorKey, clickedBtn) {
      // Update active button shade highlight
      document.querySelectorAll('.creator-tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      clickedBtn.classList.add('active');

      // Show selected CV panel and reset scroll position to top
      document.querySelectorAll('.cv-panel').forEach(panel => {
        panel.classList.add('hidden');
      });
      document.getElementById(`cv-${creatorKey}`).classList.remove('hidden');
      document.getElementById('cvScrollBox').scrollTop = 0;
    }


    // 6. Jovian Clicker game loop, permanent upgrades & local saves
    const SAVE_KEY = 'sonions_jovian_clicker_v1';
    const UPGRADE_DEFS = [
      {id:'fingies', name:'Jovian Fingies', description:'A second finger, allegedly.', type:'click', gain:1, base:15, growth:1.48, icon:'☝'},
      {id:'intern', name:'Jovian Unpaid Intern', description:'Collects crumbs of cosmic nonsense, autonomously.', type:'auto', gain:0.7, base:35, growth:1.50, icon:'◷'},
      {id:'knuckle', name:'Jovian Knuckle Sandwich', description:'A suspiciously powerful click.', type:'click', gain:5, base:100, growth:1.58, icon:'✳'},
      {id:'factory', name:'Jovian Nonsense Factory', description:'Industrial-grade jovianling manufacturing.', type:'auto', gain:6, base:280, growth:1.55, icon:'⚙'},
      {id:'turbo', name:'Jovian Hyperfingers', description:'Click with the force of a minor celestial object.', type:'click', gain:30, base:1100, growth:1.64, icon:'✦'},
      {id:'blender', name:'Jovian Singularity Blender', description:'Blends spacetime into something slightly profitable.', type:'auto', gain:55, base:2500, growth:1.60, icon:'◉'},
      {id:'moon', name:'Jovian Moon Sweatshop', description:'The moons have filed a formal complaint.', type:'auto', gain:420, base:20000, growth:1.67, icon:'☾'},
      {id:'accountant', name:'Jovian Multiverse Accountant', description:'Audits seventeen realities at the same time.', type:'auto', gain:3200, base:150000, growth:1.74, icon:'∞'},
      {id:'potato', name:'Jovian Quantum Potato', description:'Nobody knows why it works. It works.', type:'auto', gain:28000, base:1400000, growth:1.81, icon:'✺'}
    ];

    function initialState() {
      return {nickname:'', balance:0, earned:0, totalClicks:0, levels:{}, savedAt:Date.now()};
    }
    function restoreGame() {
      try {
        const data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
        if (!data || typeof data!=='object') return initialState();
        const clean=initialState();
        clean.nickname=typeof data.nickname==='string' ? data.nickname.slice(0,24) : '';
        for (const name of ['balance','earned','totalClicks','savedAt']) {
          if (Number.isFinite(data[name]) && data[name]>=0) clean[name]=data[name];
        }
        if (data.levels && typeof data.levels==='object') {
          for (const def of UPGRADE_DEFS) {
            const level=data.levels[def.id];
            clean.levels[def.id]=Number.isSafeInteger(level) && level>=0 ? Math.min(level,500) : 0;
          }
        }
        return clean;
      } catch(e) {return initialState();}
    }
    const gameState=restoreGame();
    const $=id=>document.getElementById(id);
    const formatNumber=(value)=>{
      if (!Number.isFinite(value)) return '∞';
      if (value===0) return '0';
      if (value>=1e21) return value.toExponential(2).replace('e+','e');
      if (value>=1e6) return new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(value);
      if (value>=100) return Math.floor(value).toLocaleString('en-US');
      if (value>=10) return (Math.floor(value*10)/10).toLocaleString('en-US',{maximumFractionDigits:1});
      return (Math.floor(value*100)/100).toLocaleString('en-US',{maximumFractionDigits:2});
    };
    function gainRate(type){
      return (type==='click'?1:0)+UPGRADE_DEFS.reduce((sum,def)=>sum+(def.type===type?def.gain*(gameState.levels[def.id]||0):0),0);
    }
    function upgradeCost(def){
      const level=gameState.levels[def.id]||0;
      return Math.ceil(def.base*Math.pow(def.growth,level));
    }
    function saveGame() {
      try {gameState.savedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(gameState));}catch(e){}
    }
    function earn(amount) {
      if (!(amount>0) || !Number.isFinite(amount)) return;
      gameState.balance+=amount;
      gameState.earned+=amount;
    }
    function renderShop() {
      const list=$('upgradeList');
      list.innerHTML='';
      for (const def of UPGRADE_DEFS){
        const item=document.createElement('div');
        item.className='upgrade';
        item.dataset.id=def.id;
        item.innerHTML=`<div class="upgrade-header"><div class="upgrade-title">${def.icon} &nbsp;${def.name}</div><span class="upgrade-level">LV. <span class="level-value">0</span></span></div><p class="upgrade-description">${def.description}</p><div class="upgrade-foot"><div class="upgrade-effect">+${formatNumber(def.gain)} ${def.type==='click'?'per click':'per second'}</div><button class="buy-upgrade" type="button">Buy <span class="upgrade-cost"></span></button></div>`;
        item.querySelector('.buy-upgrade').addEventListener('click',()=>purchaseUpgrade(def.id));
        list.appendChild(item);
      }
      updateGameDisplay();
    }
    function updateGameDisplay(){
      $('balanceDisplay').textContent=formatNumber(gameState.balance);
      $('clickRateDisplay').textContent=formatNumber(gainRate('click'));
      $('autoRateDisplay').textContent=formatNumber(gainRate('auto'));
      $('lifetimeDisplay').textContent=formatNumber(gameState.earned);
      $('totalClicksDisplay').textContent=formatNumber(gameState.totalClicks);
      $('playerName').textContent=gameState.nickname||'Traveler';
      let affordable=0;
      for(const def of UPGRADE_DEFS){
        const el=$('upgradeList').querySelector(`[data-id="${def.id}"]`);
        if(!el) continue;
        const cost=upgradeCost(def), canAfford=Number.isFinite(cost)&&gameState.balance>=cost;
        if(canAfford) affordable++;
        el.classList.toggle('affordable',canAfford);
        el.querySelector('.level-value').textContent=gameState.levels[def.id]||0;
        el.querySelector('.upgrade-cost').textContent=formatNumber(cost);
        el.querySelector('button').disabled=!canAfford || (gameState.levels[def.id]||0)>=500;
      }
      $('affordableCount').textContent=`${affordable} AFFORDABLE`;
      $('shopHeading').dataset.affordable=affordable;
      if(window.innerWidth<=910) $('shopToggleIcon').textContent=$('upgradeShop').classList.contains('open')?'⌄':`⌃ ${affordable}`;
    }
    function purchaseUpgrade(id){
      const def=UPGRADE_DEFS.find(x=>x.id===id);
      if(!def) return;
      const cost=upgradeCost(def);
      if(gameState.balance+1e-8<cost || !Number.isFinite(cost) || (gameState.levels[id]||0)>=500) return;
      gameState.balance=Math.max(0,gameState.balance-cost);
      gameState.levels[id]=(gameState.levels[id]||0)+1;
      updateGameDisplay();
      saveGame();
      showToast(`${def.name} upgraded to level ${gameState.levels[id]}`);
    }
    function floatReward(amount,event){
      const el=document.createElement('span');
      el.className='floating-earn';
      el.textContent=`+${formatNumber(amount)}`;
      const buttonRect=$('jovianButton').getBoundingClientRect();
      const hasPointer=Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)&&event.detail!==0;
      const x=hasPointer?event.clientX:buttonRect.left+buttonRect.width/2;
      const y=hasPointer?event.clientY:buttonRect.top+buttonRect.height/2;
      el.style.left=`${x+(Math.random()-.5)*30}px`;
      el.style.top=`${y-8}px`;
      $('floatLayer').appendChild(el);
      setTimeout(()=>el.remove(),900);
    }
    $('jovianButton').addEventListener('click',event=>{
      if(currentScene!=='game'||isTransitioning) return;
      const amount=gainRate('click');
      earn(amount);
      gameState.totalClicks++;
      const btn=$('jovianButton');
      btn.classList.add('is-pressed');
      clearTimeout(btn.pressTimer);
      btn.pressTimer=setTimeout(()=>btn.classList.remove('is-pressed'),110);
      floatReward(amount,event);
      updateGameDisplay();
    });
    function enterGameScene(){
      $('playerName').textContent=gameState.nickname||'Traveler';
      $('jovianReveal').classList.remove('growing');
      void $('jovianReveal').offsetWidth; // restart one-pixel-to-eight-centimeter spawn
      $('jovianReveal').classList.add('growing');
      $('upgradeShop').classList.remove('open');
      updateGameDisplay();
    }
    $('shopHeading').addEventListener('click',()=>{
      if(window.innerWidth>910) return;
      $('upgradeShop').classList.toggle('open');
      updateGameDisplay();
    });
    function showToast(message){
      const toast=$('gameToast');
      toast.textContent=message;
      toast.classList.add('shown');
      clearTimeout(toast.closeTimer);
      toast.closeTimer=setTimeout(()=>toast.classList.remove('shown'),1900);
    }
    function openInstructions(){ $('helpDialog').hidden=false; $('helpDialog').querySelector('.help-close').focus(); }
    function closeInstructions(){ $('helpDialog').hidden=true; }
    $('helpDialog').addEventListener('click',event=>{if(event.target===$('helpDialog'))closeInstructions();});
    window.addEventListener('keydown',event=>{if(event.key==='Escape')closeInstructions();});
    $('nicknameInput').addEventListener('input',event=>event.target.setCustomValidity(''));

    // Apply accrued automatic production in real time, even while exploring Creators.
    let lastTick=performance.now(), lastRender=0;
    function runGameLoop(now){
      const dt=Math.max(0,Math.min((now-lastTick)/1000,1));
      lastTick=now;
      earn(gainRate('auto')*dt);
      if(now-lastRender>=100){
        if(currentScene==='game') updateGameDisplay();
        lastRender=now;
      }
      requestAnimationFrame(runGameLoop);
    }
    // Restore a capped amount of offline production from a prior visit.
    const offlineSeconds=Math.max(0,Math.min((Date.now()-gameState.savedAt)/1000,8*60*60));
    const offlineGain=gainRate('auto')*offlineSeconds;
    if(offlineGain>0.01){earn(offlineGain);setTimeout(()=>showToast(`While you were away: +${formatNumber(offlineGain)} jovianlings`),1300);}
    if(gameState.nickname) $('nicknameInput').value=gameState.nickname;
    renderShop();
    requestAnimationFrame(runGameLoop);
    setInterval(saveGame,5000);
    window.addEventListener('pagehide',saveGame);
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden) saveGame();
      else {const seconds=Math.max(0,Math.min((Date.now()-gameState.savedAt)/1000,8*60*60));
        const bonus=gainRate('auto')*seconds;
        if(bonus>0.01) earn(bonus);
        lastTick=performance.now();updateGameDisplay();saveGame();}
    });
