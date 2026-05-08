/**
 * Demo Mode — intercepts every API call and returns local data.
 * No PHP, no Supabase needed. Works 100% in the browser.
 */

// ── Demo seed data ────────────────────────────────────────
const DEMO_FAMILY = {
  id:'demo-family-001', name:'Jenson',
  weekly_budget:50, point_rate:0.01, house_score:82,
  coin_name:'Jenson Coins', coin_symbol:'JC', coin_icon:'🪙',
  bucket_invest_rate: 5,        // % growth per week
  bucket_charity_name: 'Local Food Bank',
  bucket_auto_split: { spend:70, save:10, invest:10, charity:10 }, // % of earned coins auto-split
};

const DEMO_CHILDREN = [
  { id:'demo-child-001', family_id:'demo-family-001', role:'child', display_name:'Peter',   pin_hash:'1234', level:4, streak:7,  best_streak:12, rating:4.8, is_active:true, avatar_key:'robot',   balance:220, balance_save:50,  balance_invest:30, balance_charity:20, today_total:4, today_complete:3, today_pct:75,  achievement_count:5, theme:'blue'  },
  { id:'demo-child-002', family_id:'demo-family-001', role:'child', display_name:'Abigail', pin_hash:'1222', level:3, streak:3,  best_streak:9,  rating:4.5, is_active:true, avatar_key:'unicorn',  balance:130, balance_save:35,  balance_invest:10, balance_charity:10, today_total:3, today_complete:2, today_pct:67,  achievement_count:3, theme:'pink'  },
  { id:'demo-child-003', family_id:'demo-family-001', role:'child', display_name:'Scott',   pin_hash:'1233', level:2, streak:1,  best_streak:4,  rating:3.9, is_active:true, avatar_key:'fox',      balance:70,  balance_save:15,  balance_invest:5,  balance_charity:0,  today_total:3, today_complete:1, today_pct:33,  achievement_count:2, theme:'green' },
  { id:'demo-child-004', family_id:'demo-family-001', role:'child', display_name:'Elle',    pin_hash:'1111', level:1, streak:0,  best_streak:2,  rating:4.2, is_active:true, avatar_key:'cat',      balance:40,  balance_save:5,   balance_invest:0,  balance_charity:0,  today_total:2, today_complete:0, today_pct:0,   achievement_count:1, theme:'red'   },
];

const DEMO_PARENTS = [
  { id:'demo-parent-001', family_id:'demo-family-001', role:'parent', display_name:'Dad',     pin:'0000', emoji:'👨',  color:'#3B82F6' },
  { id:'demo-parent-002', family_id:'demo-family-001', role:'parent', display_name:'Mom',     pin:'9999', emoji:'👩',  color:'#EC4899' },
  { id:'demo-parent-003', family_id:'demo-family-001', role:'parent', display_name:'Grandma', pin:'1111', emoji:'👵',  color:'#F59E0B' },
  { id:'demo-parent-004', family_id:'demo-family-001', role:'parent', display_name:'Grandpa', pin:'2222', emoji:'👴',  color:'#10B981' },
];

const TODAY = new Date().toISOString().slice(0,10);

const DEMO_CHORES = [
  { id:'chore-001', family_id:'demo-family-001', title:'Make Your Bed',      category:'bedroom',  difficulty:'easy',   usd_value:0.05, points:5,  proof_type:'photo',          recurrence:'daily',  assigned_to:null,           ai_verify:false, is_active:true, video_url:null,
    description:'Make your bed neatly every morning before breakfast.',
    checklist:[],
    game_plan:[{step:1,title:'Clear the bed',description:'Remove any toys or items on the bed'},{step:2,title:'Straighten the sheets',description:'Pull the bottom sheet tight and tuck in the sides'},{step:3,title:'Lay the comforter',description:'Spread evenly, no wrinkles'},{step:4,title:'Place pillows',description:'Fluff and place pillows neatly at the headboard'}] },
  { id:'chore-002', family_id:'demo-family-001', title:'Vacuum Living Room', category:'cleaning', difficulty:'medium', usd_value:0.15, points:15, proof_type:'photo_checklist', recurrence:'weekly', assigned_to:null,           ai_verify:true,  is_active:true, video_url:null,
    description:'Vacuum the entire living room floor including corners.',
    checklist:[{id:'c1',text:'Move furniture items off floor',required:true},{id:'c2',text:'Vacuum all carpet areas',required:true},{id:'c3',text:'Get corners and edges',required:true}],
    game_plan:[{step:1,title:'Clear the floor',description:'Move shoes and small items'},{step:2,title:'Start at far end',description:'Begin at the wall farthest from the door'},{step:3,title:'Work in rows',description:'Vacuum in straight overlapping rows'}] },
  { id:'chore-003', family_id:'demo-family-001', title:'Wash the Dishes',    category:'kitchen',  difficulty:'medium', usd_value:0.15, points:15, proof_type:'photo',          recurrence:'daily',  assigned_to:'demo-child-001', ai_verify:false, is_active:true, video_url:null,
    description:'Wash, rinse, and dry all dishes in the sink.',
    checklist:[], game_plan:[] },
  { id:'chore-004', family_id:'demo-family-001', title:'Take Out Trash',     category:'cleaning', difficulty:'easy',   usd_value:0.08, points:8,  proof_type:'checklist',      recurrence:'weekly', assigned_to:null,           ai_verify:false, is_active:true, video_url:null,
    description:'Replace trash bags in kitchen and bathrooms.',
    checklist:[{id:'t1',text:'Kitchen trash emptied',required:true},{id:'t2',text:'Bathroom trash emptied',required:true},{id:'t3',text:'New bags inserted',required:true},{id:'t4',text:'Trash taken to bin outside',required:true}],
    game_plan:[] },
  { id:'chore-005', family_id:'demo-family-001', title:'Clean Your Room',    category:'bedroom',  difficulty:'hard',   usd_value:0.25, points:25, proof_type:'photo_checklist', recurrence:'weekly', assigned_to:null,           ai_verify:true,  is_active:true, video_url:null,
    description:'Full bedroom tidy — floor cleared, surfaces wiped, organized.',
    checklist:[{id:'r1',text:'Floor completely clear',required:true},{id:'r2',text:'Clothes put away or in hamper',required:true},{id:'r3',text:'Bed made',required:true},{id:'r4',text:'Desk cleared',required:false}],
    game_plan:[{step:1,title:'Start with the floor',description:'Pick up everything — clothes, toys, trash'},{step:2,title:'Sort items',description:'Clothes to hamper, toys to bins, trash to can'},{step:3,title:'Make the bed',description:'Sheets, comforter, pillows'},{step:4,title:'Clear surfaces',description:'Wipe down desk and dresser'}] },
  { id:'chore-006', family_id:'demo-family-001', title:'Feed the Pets',      category:'pets',     difficulty:'easy',   usd_value:0.08, points:8,  proof_type:'checklist',      recurrence:'daily',  assigned_to:'demo-child-002', ai_verify:false, is_active:true, video_url:null,
    description:'Feed and water all family pets on schedule.',
    checklist:[{id:'p1',text:'Food bowls filled',required:true},{id:'p2',text:'Water bowls refreshed',required:true},{id:'p3',text:'Area cleaned up',required:false}],
    game_plan:[] },
  { id:'chore-007', family_id:'demo-family-001', title:'Sweep Kitchen',      category:'kitchen',  difficulty:'easy',   usd_value:0.08, points:8,  proof_type:'photo',          recurrence:'daily',  assigned_to:null,           ai_verify:false, is_active:true, video_url:null,
    description:'Sweep the kitchen floor clean.',
    checklist:[], game_plan:[] },
  { id:'chore-008', family_id:'demo-family-001', title:'Mow the Lawn',       category:'yard',     difficulty:'hard',   usd_value:0.40, points:40, proof_type:'photo',          recurrence:'weekly', assigned_to:'demo-child-001', ai_verify:false, is_active:true, video_url:null,
    description:'Mow the front and back yard. Safety check first.',
    checklist:[], game_plan:[], org_type:'safety' },
];

const DEMO_INSTANCES = [];

// Build today's chore instances from active chores + recurrence schedule.
// Called automatically on load when the date changes, and when "Generate" is clicked.
function generateDailyInstances() {
  const now    = new Date();
  const dow    = now.getDay();   // 0=Sun … 6=Sat
  const dom    = now.getDate();  // 1-31

  DEMO_INSTANCES.splice(0, DEMO_INSTANCES.length);

  DEMO_CHORES.forEach(chore => {
    if (!chore.is_active) return;

    let due = false;
    switch (chore.recurrence) {
      case 'daily':   due = true; break;
      case 'weekly': { const days = chore.recurrence_days || []; due = days.length === 0 ? true : days.includes(dow); break; }
      case 'monthly': due = chore.recurrence_date === dom; break;
      case 'yearly':  due = (chore.recurrence_month === now.getMonth() + 1) && (chore.recurrence_yearly_day === dom); break;
      case 'once': {
        const done = DEMO_SUBMISSIONS.some(s => s.chore_id === chore.id && (s.status === 'approved' || s.status === 'submitted'));
        due = !done; break;
      }
      default: due = true;
    }
    if (!due) return;

    // null / '' = All Kids, 'any' = Free For All → both mean every child sees it
    const allKids = !chore.assigned_to || chore.assigned_to === 'any';
    const targets = allKids
      ? DEMO_CHILDREN
      : DEMO_CHILDREN.filter(c => c.id === chore.assigned_to);

    targets.forEach(child => {
      DEMO_INSTANCES.push({
        id:          `inst-${chore.id}-${child.id}-${TODAY}`,
        chore_id:    chore.id,
        family_id:   chore.family_id || DEMO_FAMILY.id || 'demo-family-001',
        assigned_to: child.id,
        due_date:    TODAY,
        status:      'pending',
        chore,
      });
    });
  });

  DEMO_CHILDREN.forEach(k => { k.today_total = DEMO_INSTANCES.filter(i => i.assigned_to === k.id).length; k.today_complete = 0; k.today_pct = 0; });
  localStorage.setItem('fos_last_instance_date', TODAY);

  // Merge status from existing submissions so progress survives page reloads
  DEMO_SUBMISSIONS.forEach(sub => {
    const inst = DEMO_INSTANCES.find(i =>
      i.id === sub.instance_id ||
      (i.chore_id === sub.chore_id && i.assigned_to === sub.child_id)
    );
    if (inst && sub.status !== 'pending') { inst.status = sub.status; inst.submission = sub; }
  });
}

const DEMO_SUBMISSIONS = [
  { id:'sub-001', chore_id:'chore-004', instance_id:'inst-004', child_id:'demo-child-001', family_id:'demo-family-001', status:'pending', points_awarded:8,  submitted_at:new Date(Date.now()-3600000).toISOString(), photo_urls:[], notes:'All done!', child:DEMO_CHILDREN[0], chore:DEMO_CHORES[3] },
  { id:'sub-002', chore_id:'chore-006', instance_id:'inst-006', child_id:'demo-child-002', family_id:'demo-family-001', status:'pending', points_awarded:8,  submitted_at:new Date(Date.now()-7200000).toISOString(), photo_urls:[], notes:'Fed them!',  child:DEMO_CHILDREN[1], chore:DEMO_CHORES[5] },
  { id:'sub-003', chore_id:'chore-001', instance_id:'inst-006', child_id:'demo-child-002', family_id:'demo-family-001', status:'approved',points_awarded:5,  submitted_at:new Date(Date.now()-86400000).toISOString(),photo_urls:[], notes:'',           child:DEMO_CHILDREN[1], chore:DEMO_CHORES[0] },
];

const DEMO_REWARDS = [
  { id:'rwd-001', family_id:'demo-family-001', title:'30 Min Extra Screen Time', category:'screen_time', usd_value:0.50, points_cost:50,  requires_approval:true,  is_active:true, description:'Extra 30 minutes on any device' },
  { id:'rwd-002', family_id:'demo-family-001', title:'Pick Dinner Tonight',       category:'experience',  usd_value:2.00, points_cost:200, requires_approval:true,  is_active:true, description:'You pick what the family eats' },
  { id:'rwd-003', family_id:'demo-family-001', title:'$5 Cash',                   category:'cash',        usd_value:5.00, points_cost:500, requires_approval:true,  is_active:true, description:'Five dollars cash from parent' },
  { id:'rwd-004', family_id:'demo-family-001', title:'Movie Night Pick',          category:'experience',  usd_value:2.00, points_cost:200, requires_approval:false, is_active:true, description:'You pick the movie' },
  { id:'rwd-005', family_id:'demo-family-001', title:'Stay Up 30 Min Late',       category:'experience',  usd_value:0.50, points_cost:50,  requires_approval:true,  is_active:true, description:'One night of extra time before bed' },
  { id:'rwd-006', family_id:'demo-family-001', title:'No Chores Day',             category:'experience',  usd_value:3.00, points_cost:300, requires_approval:true,  is_active:true, description:'One full day off from chores' },
];

const DEMO_COUPONS = [
  { id:'cpn-001', family_id:'demo-family-001', title:'$5 Cash Out',    usd_value:5,  points_cost:500,  is_repeatable:false, daily_limit:1, requires_approval:true,  assigned_to:null, is_active:true, description:null },
  { id:'cpn-002', family_id:'demo-family-001', title:'$2 Treat Money', usd_value:2,  points_cost:200,  is_repeatable:true,  daily_limit:1, requires_approval:false, assigned_to:null, is_active:true, description:'Ice cream or small treat' },
  { id:'cpn-003', family_id:'demo-family-001', title:'$10 Big Reward', usd_value:10, points_cost:1000, is_repeatable:false, daily_limit:1, requires_approval:true,  assigned_to:null, is_active:true, description:null },
];

const DEMO_LEDGER_ENTRIES = [
  ...DEMO_CHILDREN.flatMap(child => [
    { id:`led-${child.id}-1`, child_id:child.id, delta:25, reason:'chore_approved', created_at:new Date(Date.now()-86400000*1).toISOString() },
    { id:`led-${child.id}-2`, child_id:child.id, delta:15, reason:'chore_approved', created_at:new Date(Date.now()-86400000*2).toISOString() },
    { id:`led-${child.id}-3`, child_id:child.id, delta:8,  reason:'chore_approved', created_at:new Date(Date.now()-86400000*3).toISOString() },
    { id:`led-${child.id}-4`, child_id:child.id, delta:5,  reason:'chore_approved', created_at:new Date(Date.now()-86400000*4).toISOString() },
    { id:`led-${child.id}-5`, child_id:child.id, delta:-(child.balance > 50 ? 30 : 0), reason:'reward_redeemed', created_at:new Date(Date.now()-86400000*5).toISOString() },
  ]).filter(e => e.delta !== 0),
];

const DEMO_ACHIEVEMENTS = [
  { id:'ach-001', key:'first_chore',   title:'First Mission',     icon:'🎯', description:'Complete your first chore' },
  { id:'ach-002', key:'streak_3',      title:'3-Day Streak',      icon:'🔥', description:'3 days in a row' },
  { id:'ach-003', key:'streak_7',      title:'Week Warrior',      icon:'⚡', description:'7 days in a row' },
  { id:'ach-004', key:'points_100',    title:'Century Club',      icon:'💯', description:'Earn 100 total points' },
  { id:'ach-005', key:'chores_10',     title:'Chore Champion',    icon:'🌟', description:'Complete 10 chores' },
  { id:'ach-006', key:'streak_30',     title:'Monthly Hero',      icon:'🏆', description:'30 days in a row' },
  { id:'ach-007', key:'points_500',    title:'High Scorer',       icon:'💎', description:'Earn 500 total points' },
  { id:'ach-008', key:'chores_50',     title:'Chore Master',      icon:'👑', description:'Complete 50 chores' },
  { id:'ach-009', key:'first_reward',  title:'First Reward',      icon:'🎁', description:'Redeem your first reward' },
  { id:'ach-010', key:'speed_demon',   title:'Speed Demon',       icon:'💨', description:'Complete 3 chores in one day' },
  { id:'ach-011', key:'perfect_week',  title:'Perfect Week',      icon:'✨', description:'All chores done 7 days straight' },
  { id:'ach-012', key:'top_rank',      title:'Top of the Board',  icon:'🥇', description:'Reach #1 on the leaderboard' },
];

const DEMO_USER_ACHIEVEMENTS = [
  { id:'ua-1', user_id:'demo-child-001', achievement: DEMO_ACHIEVEMENTS[0] },
  { id:'ua-2', user_id:'demo-child-001', achievement: DEMO_ACHIEVEMENTS[1] },
  { id:'ua-3', user_id:'demo-child-001', achievement: DEMO_ACHIEVEMENTS[2] },
  { id:'ua-4', user_id:'demo-child-001', achievement: DEMO_ACHIEVEMENTS[3] },
  { id:'ua-5', user_id:'demo-child-001', achievement: DEMO_ACHIEVEMENTS[4] },
  { id:'ua-6', user_id:'demo-child-002', achievement: DEMO_ACHIEVEMENTS[0] },
  { id:'ua-7', user_id:'demo-child-002', achievement: DEMO_ACHIEVEMENTS[1] },
  { id:'ua-8', user_id:'demo-child-002', achievement: DEMO_ACHIEVEMENTS[3] },
  { id:'ua-9', user_id:'demo-child-003', achievement: DEMO_ACHIEVEMENTS[0] },
  { id:'ua-10',user_id:'demo-child-003', achievement: DEMO_ACHIEVEMENTS[1] },
  { id:'ua-11',user_id:'demo-child-004', achievement: DEMO_ACHIEVEMENTS[0] },
];

// Coupon requests from kids — child ref populated after DEMO_CHILDREN is defined
const DEMO_COUPON_REQUESTS = [
  { id:'creq-001', child_id:'demo-child-001', family_id:'demo-family-001', title:'Movie Night Out', description:'Want to go to the movies this weekend', status:'pending', created_at:new Date(Date.now()-3600000*2).toISOString(), get child() { return DEMO_CHILDREN.find(c=>c.id==='demo-child-001'); } },
  { id:'creq-002', child_id:'demo-child-002', family_id:'demo-family-001', title:'Sleepover Permission', description:'Can my friend sleep over Friday?', status:'pending', created_at:new Date(Date.now()-3600000*5).toISOString(), get child() { return DEMO_CHILDREN.find(c=>c.id==='demo-child-002'); } },
];

// Parent chores (assigned per parent)
const DEMO_PARENT_CHORES = [
  { id:'pc-001', assigned_to:'demo-parent-001', title:'Mow the lawn',          recurrence:'weekly',  done:false, created_at:new Date().toISOString() },
  { id:'pc-002', assigned_to:'demo-parent-001', title:'Take out the trash',     recurrence:'daily',   done:true,  created_at:new Date().toISOString() },
  { id:'pc-003', assigned_to:'demo-parent-001', title:'Car maintenance check',  recurrence:'monthly', done:false, created_at:new Date().toISOString() },
  { id:'pc-004', assigned_to:'demo-parent-001', title:'Fix kitchen faucet',     recurrence:'once',    done:false, created_at:new Date().toISOString() },
  { id:'pc-005', assigned_to:'demo-parent-002', title:'Grocery shopping',       recurrence:'weekly',  done:false, created_at:new Date().toISOString() },
  { id:'pc-006', assigned_to:'demo-parent-002', title:'Plan this week\'s meals',recurrence:'weekly',  done:true,  created_at:new Date().toISOString() },
  { id:'pc-007', assigned_to:'demo-parent-002', title:'Schedule dentist appts', recurrence:'once',    done:false, created_at:new Date().toISOString() },
  { id:'pc-008', assigned_to:'demo-parent-002', title:'Pay utility bills',      recurrence:'monthly', done:false, created_at:new Date().toISOString() },
];

// Parent tasks
const DEMO_PARENT_TASKS = [
  { id:'ptask-001', family_id:'demo-family-001', title:'Pay bills', done:false,  created_at:new Date().toISOString() },
  { id:'ptask-002', family_id:'demo-family-001', title:'Grocery run', done:false, created_at:new Date().toISOString() },
  { id:'ptask-003', family_id:'demo-family-001', title:'Schedule dentist', done:true,  created_at:new Date().toISOString() },
];

// Layaway / group savings goals
const DEMO_LAYAWAY = [
  {
    id:'lay-001', family_id:'demo-family-001', title:'Nintendo Switch Game', description:'Mario Kart 8 Deluxe — all play together!',
    total_cost:500, status:'active', created_at:new Date(Date.now()-86400000*5).toISOString(),
    contributions:[
      { child_id:'demo-child-001', name:'Peter',   amount:150, date:'2026-04-20' },
      { child_id:'demo-child-002', name:'Abigail', amount:100, date:'2026-04-22' },
    ]
  },
  {
    id:'lay-002', family_id:'demo-family-001', title:'Family Movie Night', description:'Snacks + streaming rental for everyone',
    total_cost:150, status:'funded', created_at:new Date(Date.now()-86400000*2).toISOString(),
    contributions:[
      { child_id:'demo-child-001', name:'Peter',   amount:50, date:'2026-04-25' },
      { child_id:'demo-child-002', name:'Abigail', amount:50, date:'2026-04-25' },
      { child_id:'demo-child-003', name:'Scott',   amount:50, date:'2026-04-26' },
    ]
  },
];

// Mutable pending redemptions (built at runtime + seeded)
const DEMO_PENDING_REDEMPTIONS = [
  { id:'rr-001', type:'reward', reward_id:'rwd-001', child_id:'demo-child-001', points_spent:50,  status:'pending', redeemed_at:new Date(Date.now()-3600000).toISOString(),  child:DEMO_CHILDREN[0], reward:DEMO_REWARDS[0] },
  { id:'rr-002', type:'reward', reward_id:'rwd-004', child_id:'demo-child-002', points_spent:60,  status:'pending', redeemed_at:new Date(Date.now()-7200000).toISOString(),  child:DEMO_CHILDREN[1], reward:DEMO_REWARDS[3] },
  { id:'cr-001', type:'coupon', coupon_id:'cpn-002', child_id:'demo-child-003', points_spent:200, status:'pending', redeemed_at:new Date(Date.now()-1800000).toISOString(),  child:DEMO_CHILDREN[2], coupon:DEMO_COUPONS[1] },
];

// ── Auto-split earned coins into buckets ─────────────────
function splitCoins(kid, pts) {
  const sp = DEMO_FAMILY.bucket_auto_split || { spend:70, save:10, invest:10, charity:10 };
  const spend   = Math.round(pts * (sp.spend   || 70) / 100);
  const save    = Math.round(pts * (sp.save    || 10) / 100);
  const invest  = Math.round(pts * (sp.invest  || 10) / 100);
  const charity = pts - spend - save - invest; // remainder avoids rounding gaps
  kid.balance           = (kid.balance           || 0) + spend;
  kid.balance_save      = (kid.balance_save      || 0) + save;
  kid.balance_invest    = (kid.balance_invest    || 0) + invest;
  kid.balance_charity   = (kid.balance_charity   || 0) + Math.max(0, charity);
}

// ── Route interceptor ─────────────────────────────────────
function demoRoute(path, method, body) {
  const p = path.replace(/\?.*$/, '');
  const q = Object.fromEntries(new URLSearchParams(path.includes('?') ? path.split('?')[1] : ''));

  const user     = JSON.parse(localStorage.getItem('fos_user') || '{}');
  const isParent = user.role === 'parent';
  const childId  = user.id;

  // PIN LOGIN (children + parents)
  if (p.includes('auth/pin-login')) {
    const realParents  = JSON.parse(localStorage.getItem('fos_real_parents')  || '[]');
    const realChildren = JSON.parse(localStorage.getItem('fos_real_children') || '[]');
    const allParents   = [...realParents,  ...DEMO_PARENTS];
    const allChildren  = [...realChildren, ...DEMO_CHILDREN];
    const realFamily   = JSON.parse(localStorage.getItem('fos_real_family') || 'null') || DEMO_FAMILY;

    const parent = allParents.find(pr => pr.id === body?.child_id);
    if (parent) {
      const expectedPin = parent.pin || parent.pin_hash;
      if (expectedPin !== body?.pin) return Promise.reject(new Error('Wrong PIN. Try again!'));
      return ok({ token:`demo-parent-token-${parent.id}`, user:{ ...parent }, family: realFamily });
    }
    const demoPins = { 'demo-child-001':'1234','demo-child-002':'1222','demo-child-003':'1233','demo-child-004':'1111' };
    const child = allChildren.find(c => c.id === body?.child_id);
    if (!child) return Promise.reject(new Error('User not found.'));
    const expectedPin = child.pin_hash || child.pin || demoPins[child.id];
    if (expectedPin !== body?.pin) {
      return Promise.reject(new Error('Incorrect PIN. Try again!'));
    }
    return ok({ token:`demo-child-token-${child.id}`, user:{...child}, family: realFamily });
  }

  // AUTH
  if (p.includes('auth/me')) {
    const earned = DEMO_USER_ACHIEVEMENTS.filter(a=>a.user_id===childId);
    // Return live record so balance/level reflect post-approval updates
    const liveUser = isParent
      ? DEMO_PARENTS.find(p=>p.id===user.id) || user
      : DEMO_CHILDREN.find(c=>c.id===childId) || user;
    return ok({ user: liveUser, family: DEMO_FAMILY, achievements: earned, all_achievements: DEMO_ACHIEVEMENTS });
  }

  // CHORES
  if (p.includes('chores/index')) {
    if (method === 'POST') {
      const nc = { id:'chore-'+Date.now(), family_id:'demo-family-001', checklist:[], game_plan:[], is_active:true, ...body };
      DEMO_CHORES.push(nc);
      if (window._saveRealData) window._saveRealData();
      return ok(nc);
    }
    return ok(isParent ? DEMO_CHORES : DEMO_CHORES.filter(c=>!c.assigned_to||c.assigned_to==='any'||c.assigned_to===childId));
  }
  if (p.includes('chores/detail')) {
    if (method === 'PUT' || method === 'PATCH') {
      const idx = DEMO_CHORES.findIndex(c=>c.id===q.id);
      if (idx>=0) Object.assign(DEMO_CHORES[idx], body);
      if (window._saveRealData) window._saveRealData();
      return ok(DEMO_CHORES[idx] || body);
    }
    if (method === 'DELETE') {
      const idx = DEMO_CHORES.findIndex(c=>c.id===q.id);
      if (idx>=0) DEMO_CHORES.splice(idx,1);
      if (window._saveRealData) window._saveRealData();
      return ok({ deleted:true });
    }
    return ok(DEMO_CHORES.find(c=>c.id===q.id) || DEMO_CHORES[0]);
  }
  if (p.includes('chores/templates')) return ok(DEMO_CHORES);
  if (p.includes('chores/instances')) {
    if (method === 'POST') {
      generateDailyInstances();
      return ok({ created: DEMO_INSTANCES.length, date: TODAY, chores: DEMO_INSTANCES.map(i=>i.chore?.title||'Chore') });
    }
    const inst = isParent ? DEMO_INSTANCES : DEMO_INSTANCES.filter(i=>i.assigned_to===childId);
    return ok(inst);
  }

  // SUBMISSIONS
  if (p.includes('submissions/index')) {
    if (method === 'POST') {
      const _subChore = DEMO_CHORES.find(c=>c.id===body?.chore_id)||DEMO_CHORES[0];
      const _aiScore  = _subChore?.ai_verify ? (Math.floor(Math.random()*3)+3) : null; // 3-5 when AI enabled
      const ns = { id:'sub-'+Date.now(), ...body, child_id: user?.id, status:'submitted', submitted_at:new Date().toISOString(), child:user, chore:_subChore, ai_score:_aiScore };
      DEMO_SUBMISSIONS.push(ns);
      if (window._saveRealData) window._saveRealData();
      // Mark the instance as submitted so it disappears from kid's dashboard
      const inst = DEMO_INSTANCES.find(i => i.id === body?.instance_id);
      if (inst) inst.status = 'submitted';
      return ok(ns);
    }
    const status = q.status;
    const subs   = isParent ? DEMO_SUBMISSIONS : DEMO_SUBMISSIONS.filter(s=>s.child_id===childId);
    return ok(status ? subs.filter(s=>s.status===status) : subs);
  }
  if (p.includes('submissions/review')) {
    const action = body?.action;
    const pts    = body?.points || 8;
    const sub    = DEMO_SUBMISSIONS.find(s=>s.id===body?.submission_id);
    if (sub) {
      sub.status = action==='approve' ? 'approved' : 'rejected';
      if (body?.feedback) sub.feedback = body.feedback;
      if (body?.ai_stars) sub.ai_stars = body.ai_stars;
      if (action === 'approve') {
        const kid = DEMO_CHILDREN.find(c=>c.id===sub.child_id);
        if (kid) {
          splitCoins(kid, pts);
          kid.today_complete = Math.min((kid.today_complete||0)+1, kid.today_total||4);
          kid.today_pct = Math.round((kid.today_complete / (kid.today_total||4)) * 100);
          // Update streak PR if current streak beats personal record
          if ((kid.streak||0) > (kid.best_streak||0)) kid.best_streak = kid.streak;
          DEMO_LEDGER_ENTRIES.push({ id:'led-'+Date.now(), child_id:kid.id, delta:pts, reason:'chore_approved', created_at:new Date().toISOString() });
        }
      }
      if (window._saveRealData) window._saveRealData();
    }
    return ok({ status: action==='approve'?'approved':'rejected', points_awarded: pts });
  }

  // POINTS
  if (p.includes('points/ledger')) {
    const cid    = q.child_id || childId;
    const child  = DEMO_CHILDREN.find(c=>c.id===cid) || DEMO_CHILDREN[0];
    const entries= DEMO_LEDGER_ENTRIES.filter(e=>e.child_id===cid);
    const earned = entries.filter(e=>e.delta>0).reduce((s,e)=>s+e.delta,0);
    const spent  = Math.abs(entries.filter(e=>e.delta<0).reduce((s,e)=>s+e.delta,0));
    return ok({ balance: child.balance, earned, spent, entries });
  }
  if (p.includes('points/grant')) {
    const kid = DEMO_CHILDREN.find(c=>c.id===body?.child_id) || DEMO_CHILDREN[0];
    const pts = parseInt(body?.points) || 0;
    if (kid && pts > 0) {
      splitCoins(kid, pts);
      DEMO_LEDGER_ENTRIES.push({ id:'led-'+Date.now(), child_id:kid.id, delta:pts, reason:body?.reason||'bonus', created_at:new Date().toISOString() });
      if (window._saveRealData) window._saveRealData();
    }
    return ok({ child_id:kid?.id, points:pts, balance:kid?.balance });
  }
  if (p.includes('points/deduct')) {
    const kid = DEMO_CHILDREN.find(c=>c.id===body?.child_id);
    const pts = Math.abs(parseInt(body?.points) || 0);
    if (!kid) return err('Child not found');
    if (pts < 1) return err('Invalid amount');
    kid.balance = Math.max(0, (kid.balance || 0) - pts);
    DEMO_LEDGER_ENTRIES.push({ id:'led-'+Date.now(), child_id:kid.id, delta:-pts, reason:body?.reason||'demerit', created_at:new Date().toISOString() });
    if (window._saveRealData) window._saveRealData();
    return ok({ child_id:kid.id, deducted:pts, balance:kid.balance });
  }
  if (p.includes('points/leaderboard')) {
    const board = [...DEMO_CHILDREN]
      .sort((a,b)=>b.balance-a.balance)
      .map((c,i)=>({ child_id:c.id, name:c.display_name, avatar_key:c.avatar_key, avatar_url:c.avatar_url, streak:c.streak, level:c.level, rating:c.rating, balance:c.balance, earned:c.balance+20, chore_count:8-i*2, rank:i+1 }));
    return ok({ period: q.period||'week', leaderboard: board });
  }

  // REWARDS
  if (p.includes('rewards/redeem')) {
    if (method === 'GET') {
      return ok(DEMO_PENDING_REDEMPTIONS.filter(r=>r.type==='reward' && r.status==='pending'));
    }
    if (body?.action) {
      // Parent approving/rejecting a redemption
      const red = DEMO_PENDING_REDEMPTIONS.find(r=>r.id===body.redemption_id);
      if (red) { red.status = body.action==='approve' ? 'approved' : 'rejected'; if (window._saveRealData) window._saveRealData(); }
      return ok({ status: body.action==='approve' ? 'approved' : 'rejected' });
    }
    // Child redeeming a reward
    const rwd = DEMO_REWARDS.find(r=>r.id===body?.reward_id);
    const cost = rwd?.points_cost || body?.points_cost || 50;
    const kid  = DEMO_CHILDREN.find(c=>c.id===childId);
    if (kid && kid.balance >= cost) {
      kid.balance -= cost;
      DEMO_LEDGER_ENTRIES.push({ id:'led-'+Date.now(), child_id:kid.id, delta:-cost, reason:'reward_redeemed', created_at:new Date().toISOString() });
      DEMO_PENDING_REDEMPTIONS.push({ id:'rr-'+Date.now(), type:'reward', reward_id:body?.reward_id, child_id:childId, points_spent:cost, status:'pending', redeemed_at:new Date().toISOString(), child:kid, reward:rwd });
      if (window._saveRealData) window._saveRealData();
    }
    return ok({ status:'pending', new_balance:(kid?.balance||0) });
  }
  if (p.includes('rewards/index')) {
    if (method === 'POST') {
      const nr = { id:'rwd-'+Date.now(), family_id:'demo-family-001', is_active:true, requires_approval:true, ...body };
      DEMO_REWARDS.push(nr);
      if (window._saveRealData) window._saveRealData();
      return ok(nr);
    }
    if (method === 'PUT' || method === 'PATCH') {
      const idx = DEMO_REWARDS.findIndex(r=>r.id===q.id);
      if (idx>=0) Object.assign(DEMO_REWARDS[idx], body);
      if (window._saveRealData) window._saveRealData();
      return ok(DEMO_REWARDS[idx] || body);
    }
    if (method === 'DELETE') {
      const idx = DEMO_REWARDS.findIndex(r=>r.id===q.id);
      if (idx>=0) DEMO_REWARDS.splice(idx,1);
      if (window._saveRealData) window._saveRealData();
      return ok({ deleted:true });
    }
    return ok(DEMO_REWARDS);
  }

  // COUPONS
  if (p.includes('coupons/redeem')) {
    if (method === 'GET') {
      return ok(DEMO_PENDING_REDEMPTIONS.filter(r=>r.type==='coupon' && r.status==='pending'));
    }
    if (body?.action) {
      // Parent approving/rejecting a coupon redemption
      const red = DEMO_PENDING_REDEMPTIONS.find(r=>r.id===body.redemption_id);
      if (red) { red.status = body.action==='approve' ? 'approved' : 'rejected'; if (window._saveRealData) window._saveRealData(); }
      return ok({ status: body.action==='approve' ? 'approved' : 'rejected' });
    }
    // Child redeeming a coupon
    const cpn  = DEMO_COUPONS.find(c=>c.id===body?.coupon_id);
    const cost = cpn?.points_cost || body?.points_cost || 200;
    const kid  = DEMO_CHILDREN.find(c=>c.id===childId);
    if (kid && kid.balance >= cost) {
      kid.balance -= cost;
      DEMO_LEDGER_ENTRIES.push({ id:'led-'+Date.now(), child_id:kid.id, delta:-cost, reason:'coupon_redeemed', created_at:new Date().toISOString() });
      DEMO_PENDING_REDEMPTIONS.push({ id:'cr-'+Date.now(), type:'coupon', coupon_id:body?.coupon_id, child_id:childId, points_spent:cost, status:'pending', redeemed_at:new Date().toISOString(), child:kid, coupon:cpn });
      if (window._saveRealData) window._saveRealData();
    }
    return ok({ status:'pending', new_balance:(kid?.balance||0) });
  }
  if (p.includes('coupons/index')) {
    if (method === 'POST') {
      const nc = { id:'cpn-'+Date.now(), family_id:'demo-family-001', is_active:true, is_repeatable:false, daily_limit:1, requires_approval:true, ...body };
      if (nc.points_cost == null && nc.usd_value > 0) nc.points_cost = Math.round(nc.usd_value / (DEMO_FAMILY.point_rate||0.01));
      DEMO_COUPONS.push(nc);
      if (window._saveRealData) window._saveRealData();
      return ok(nc);
    }
    if (method === 'PUT' || method === 'PATCH') {
      const idx = DEMO_COUPONS.findIndex(c=>c.id===q.id);
      if (idx>=0) Object.assign(DEMO_COUPONS[idx], body);
      if (window._saveRealData) window._saveRealData();
      return ok(DEMO_COUPONS[idx]||body);
    }
    if (method === 'DELETE') {
      const idx = DEMO_COUPONS.findIndex(c=>c.id===q.id);
      if (idx>=0) DEMO_COUPONS.splice(idx,1);
      if (window._saveRealData) window._saveRealData();
      return ok({ deleted:true });
    }
    return ok(DEMO_COUPONS);
  }

  // COUPON REQUESTS (kids requesting custom coupons)
  if (p.includes('coupons/request')) {
    if (method === 'GET') return ok(DEMO_COUPON_REQUESTS.filter(r=>!q.status||r.status===q.status));
    if (method === 'POST') {
      const nr = { id:'creq-'+Date.now(), child_id:childId, family_id:'demo-family-001', status:'pending', created_at:new Date().toISOString(), child:DEMO_CHILDREN.find(c=>c.id===childId)||DEMO_CHILDREN[0], ...body };
      DEMO_COUPON_REQUESTS.push(nr);
      if (window._saveRealData) window._saveRealData();
      return ok(nr);
    }
    if (method === 'PATCH') {
      const idx = DEMO_COUPON_REQUESTS.findIndex(r=>r.id===q.id);
      if (idx>=0) { Object.assign(DEMO_COUPON_REQUESTS[idx], body); if (window._saveRealData) window._saveRealData(); }
      return ok(DEMO_COUPON_REQUESTS[idx]||body);
    }
    return ok(DEMO_COUPON_REQUESTS);
  }

  // LAYAWAY / GROUP SAVINGS
  if (p.includes('layaway/contribute')) {
    const goal = DEMO_LAYAWAY.find(l=>l.id===body?.goal_id);
    const kid  = DEMO_CHILDREN.find(c=>c.id===(body?.child_id||childId));
    const amt  = parseInt(body?.amount)||0;
    if (!goal) return err('Goal not found');
    if (!kid || kid.balance < amt) return err('Not enough coins');
    kid.balance -= amt;
    DEMO_LEDGER_ENTRIES.push({ id:'led-'+Date.now(), child_id:kid.id, delta:-amt, reason:'layaway:'+goal.title, created_at:new Date().toISOString() });
    const existing = goal.contributions.find(c=>c.child_id===kid.id);
    if (existing) existing.amount += amt;
    else goal.contributions.push({ child_id:kid.id, name:kid.display_name, amount:amt, date:new Date().toISOString().split('T')[0] });
    const raised = goal.contributions.reduce((s,c)=>s+c.amount,0);
    if (raised >= goal.total_cost) goal.status = 'funded';
    if (window._saveRealData) window._saveRealData();
    return ok(goal);
  }
  if (p.includes('layaway')) {
    if (method === 'POST') {
      const nl = { id:'lay-'+Date.now(), family_id:'demo-family-001', contributions:[], status:'active', created_at:new Date().toISOString(), ...body };
      DEMO_LAYAWAY.push(nl);
      if (window._saveRealData) window._saveRealData();
      return ok(nl);
    }
    if (method === 'PATCH') {
      const idx = DEMO_LAYAWAY.findIndex(l=>l.id===q.id);
      if (idx>=0) Object.assign(DEMO_LAYAWAY[idx], body);
      if (window._saveRealData) window._saveRealData();
      return ok(DEMO_LAYAWAY[idx]||body);
    }
    if (method === 'DELETE') {
      const idx = DEMO_LAYAWAY.findIndex(l=>l.id===q.id);
      if (idx>=0) DEMO_LAYAWAY.splice(idx,1);
      if (window._saveRealData) window._saveRealData();
      return ok({ deleted:true });
    }
    return ok(DEMO_LAYAWAY);
  }

  // PARENT CHORES
  if (p.includes('parent/chores')) {
    const parentId = user.id;
    if (method === 'POST') {
      const nc = { id:'pc-'+Date.now(), assigned_to:parentId, done:false, created_at:new Date().toISOString(), ...body };
      DEMO_PARENT_CHORES.push(nc);
      if (window._saveRealData) window._saveRealData();
      return ok(nc);
    }
    if (method === 'PATCH') {
      const idx = DEMO_PARENT_CHORES.findIndex(c=>c.id===q.id);
      if (idx>=0) Object.assign(DEMO_PARENT_CHORES[idx], body);
      if (window._saveRealData) window._saveRealData();
      return ok(DEMO_PARENT_CHORES[idx]||body);
    }
    if (method === 'DELETE') {
      const idx = DEMO_PARENT_CHORES.findIndex(c=>c.id===q.id);
      if (idx>=0) DEMO_PARENT_CHORES.splice(idx,1);
      if (window._saveRealData) window._saveRealData();
      return ok({ deleted:true });
    }
    return ok(DEMO_PARENT_CHORES.filter(c=>c.assigned_to===parentId));
  }

  // PARENT TASKS
  if (p.includes('parent/tasks')) {
    if (method === 'POST') {
      const nt = { id:'ptask-'+Date.now(), family_id:'demo-family-001', done:false, created_at:new Date().toISOString(), ...body };
      DEMO_PARENT_TASKS.push(nt);
      if (window._saveRealData) window._saveRealData();
      return ok(nt);
    }
    if (method === 'PATCH') {
      const idx = DEMO_PARENT_TASKS.findIndex(t=>t.id===q.id);
      if (idx>=0) Object.assign(DEMO_PARENT_TASKS[idx], body);
      if (window._saveRealData) window._saveRealData();
      return ok(DEMO_PARENT_TASKS[idx]||body);
    }
    if (method === 'DELETE') {
      const idx = DEMO_PARENT_TASKS.findIndex(t=>t.id===q.id);
      if (idx>=0) DEMO_PARENT_TASKS.splice(idx,1);
      if (window._saveRealData) window._saveRealData();
      return ok({ deleted:true });
    }
    return ok(DEMO_PARENT_TASKS);
  }

  // BUCKETS (save / invest / charity)
  if (p.includes('buckets/config')) {
    if (method === 'PATCH' && body) {
      if (body.bucket_invest_rate   != null) DEMO_FAMILY.bucket_invest_rate   = body.bucket_invest_rate;
      if (body.bucket_charity_name  != null) DEMO_FAMILY.bucket_charity_name  = body.bucket_charity_name;
      if (body.bucket_auto_split    != null) DEMO_FAMILY.bucket_auto_split    = body.bucket_auto_split;
      if (window._saveRealData) window._saveRealData();
    }
    return ok({ invest_rate: DEMO_FAMILY.bucket_invest_rate, charity_name: DEMO_FAMILY.bucket_charity_name, auto_split: DEMO_FAMILY.bucket_auto_split });
  }
  if (p.includes('buckets/transfer')) {
    // body: { from: 'balance'|'balance_save'|'balance_invest'|'balance_charity', to: same, amount: number }
    const kid = DEMO_CHILDREN.find(c => c.id === (body?.child_id || childId));
    if (!kid) return err('Child not found');
    const amt  = parseInt(body?.amount) || 0;
    const from = body?.from || 'balance';
    const to   = body?.to   || 'balance_save';
    if (amt < 1)           return err('Amount must be at least 1');
    if ((kid[from] || 0) < amt) return err('Not enough coins in that bucket');
    kid[from] = (kid[from] || 0) - amt;
    kid[to]   = (kid[to]   || 0) + amt;
    window._saveRealData();
    return ok({ child_id: kid.id, from, to, amount: amt, balance: kid.balance, balance_save: kid.balance_save, balance_invest: kid.balance_invest, balance_charity: kid.balance_charity });
  }
  if (p.includes('buckets/balances')) {
    const cid = q.child_id || childId;
    const kid = DEMO_CHILDREN.find(c => c.id === cid) || DEMO_CHILDREN[0];
    return ok({ spend: kid.balance||0, save: kid.balance_save||0, invest: kid.balance_invest||0, charity: kid.balance_charity||0, balance: kid.balance||0, balance_save: kid.balance_save||0, balance_invest: kid.balance_invest||0, balance_charity: kid.balance_charity||0 });
  }
  if (p.includes('buckets/donate')) {
    const kid = DEMO_CHILDREN.find(c => c.id === (body?.child_id || childId));
    if (!kid) return err('Child not found');
    const amt = parseInt(body?.amount) || 0;
    if (amt < 1 || (kid.balance_charity || 0) < amt) return err('Not enough in charity bucket');
    kid.balance_charity = (kid.balance_charity || 0) - amt;
    DEMO_LEDGER_ENTRIES.push({ id:'led-'+Date.now(), child_id:kid.id, delta:-amt, reason:'charity:' + (DEMO_FAMILY.bucket_charity_name||'Charity'), created_at:new Date().toISOString() });
    if (window._saveRealData) window._saveRealData();
    return ok({ donated: amt, charity: DEMO_FAMILY.bucket_charity_name, new_balance_charity: kid.balance_charity });
  }

  // PARENTS LIST
  if (p.includes('users/parents')) {
    return ok(DEMO_PARENTS.map(pr => ({ ...pr })));
  }

  // CHILDREN
  if (p.includes('users/children')) {
    if (method === 'POST') {
      const nc = { id:'demo-child-'+Date.now(), family_id:'demo-family-001', role:'child', is_active:true, level:1, streak:0, rating:5, balance:0, today_total:0, today_complete:0, today_pct:0, achievement_count:0, avatar_key:'cat', ...body };
      DEMO_CHILDREN.push(nc);
      if (window._saveRealData) window._saveRealData();
      return ok(nc);
    }
    return ok(DEMO_CHILDREN.map(c=>({...c})));
  }
  if (p.includes('users/child')) {
    if (method === 'PATCH') {
      const idx = DEMO_CHILDREN.findIndex(c=>c.id===q.id);
      if (idx>=0) Object.assign(DEMO_CHILDREN[idx], body);
      if (window._saveRealData) window._saveRealData();
      return ok(DEMO_CHILDREN[idx]||body);
    }
    if (method === 'DELETE') {
      const idx = DEMO_CHILDREN.findIndex(c=>c.id===q.id);
      if (idx>=0) DEMO_CHILDREN.splice(idx,1);
      if (window._saveRealData) window._saveRealData();
      return ok({ deleted:true });
    }
    return ok({ ...DEMO_CHILDREN.find(c=>c.id===q.id)||DEMO_CHILDREN[0], balance:320, achievements:DEMO_USER_ACHIEVEMENTS, total_chores_completed:18 });
  }

  // FAMILY
  if (p.includes('families/settings')) {
    if (method === 'PATCH' && body) {
      Object.assign(DEMO_FAMILY, body);
      if (window._saveRealData) window._saveRealData();
    }
    return ok({ family: DEMO_FAMILY, settings:{ ai_enabled:true, timezone:'America/Denver' } });
  }

  // AI
  if (p.includes('ai/verify'))   return ok({ status:'approved', confidence:0.91, reasoning:'Chore looks complete!', feedback:'Great job! Looks clean and tidy!' });
  if (p.includes('ai/organize')) return ok({ title:'Room Organization Plan', steps:[
    {step:1,action:'Clear everything off the floor',       tip:'Make one big pile first!'},
    {step:2,action:'Sort into keep, put away, trash',      tip:"If you haven't used it in 3 months, donate it"},
    {step:3,action:'Trash goes out first',                 tip:'Makes the pile much smaller fast'},
    {step:4,action:'Put away items one category at a time',tip:'Everything has a home — find it!'},
    {step:5,action:'Wipe surfaces & do a final sweep',     tip:'Looks amazing when it sparkles!'},
  ], encouragement:"You've got this! A tidy space = a tidy mind! 🚀", estimated_minutes:20 });

  // UPLOAD
  if (p.includes('upload/image')) return ok({ url:'https://placehold.co/400x300?text=Photo', path:'demo/photo.jpg' });

  return ok(null);
}

function ok(data) {
  return Promise.resolve({ success:true, message:'OK', data });
}

function err(msg) {
  return Promise.reject(new Error(msg));
}

// ── Init demo mode ────────────────────────────────────────
(function initDemo() {
  // Enable local data layer whenever a family exists in localStorage (no demo flag needed)
  window.DEMO_MODE         = localStorage.getItem('fos_real_family') !== null || localStorage.getItem('fos_demo') === '1';
  window.DEMO_ROUTE        = demoRoute;

  // Load real family data if the signup wizard was used
  const realFamily      = JSON.parse(localStorage.getItem('fos_real_family')        || 'null');
  const realChildren    = JSON.parse(localStorage.getItem('fos_real_children')      || 'null');
  const realParents     = JSON.parse(localStorage.getItem('fos_real_parents')       || 'null');
  const realLayaway     = JSON.parse(localStorage.getItem('fos_real_layaway')       || 'null');
  const realParentChores= JSON.parse(localStorage.getItem('fos_real_parent_chores') || 'null');
  const realParentTasks = JSON.parse(localStorage.getItem('fos_real_parent_tasks')  || 'null');
  const realChores       = JSON.parse(localStorage.getItem('fos_real_chores')        || 'null');
  const realRewards      = JSON.parse(localStorage.getItem('fos_real_rewards')       || 'null');
  const realCoupons      = JSON.parse(localStorage.getItem('fos_real_coupons')       || 'null');
  const realSubmissions  = JSON.parse(localStorage.getItem('fos_real_submissions')   || 'null');
  const realRedemptions  = JSON.parse(localStorage.getItem('fos_real_redemptions')   || 'null');
  const realCpnRequests  = JSON.parse(localStorage.getItem('fos_real_cpn_requests')  || 'null');

  if (realFamily) {
    Object.keys(realFamily).forEach(k => {
      if (realFamily[k] !== undefined && realFamily[k] !== null) DEMO_FAMILY[k] = realFamily[k];
    });
    if (realChildren)     DEMO_CHILDREN.splice(0, DEMO_CHILDREN.length, ...realChildren);
    if (realParents)      DEMO_PARENTS.splice(0, DEMO_PARENTS.length, ...realParents);
    if (realLayaway)      DEMO_LAYAWAY.splice(0, DEMO_LAYAWAY.length, ...realLayaway);
    if (realParentChores) DEMO_PARENT_CHORES.splice(0, DEMO_PARENT_CHORES.length, ...realParentChores);
    if (realParentTasks)  DEMO_PARENT_TASKS.splice(0, DEMO_PARENT_TASKS.length, ...realParentTasks);
    if (realChores) {
      // Backfill usd_value on any persisted chore missing it (points × default $0.01 rate)
      realChores.forEach(c => { if (!c.usd_value && c.points) c.usd_value = parseFloat((c.points * 0.01).toFixed(2)); });
      DEMO_CHORES.splice(0, DEMO_CHORES.length, ...realChores);
    }
    if (realRewards) {
      // Backfill usd_value on any persisted reward that's missing it
      const _usdMap = {'rwd-001':0.50,'rwd-002':2.00,'rwd-003':5.00,'rwd-004':2.00,'rwd-005':0.50,'rwd-006':3.00};
      realRewards.forEach(r => { if (!r.usd_value && _usdMap[r.id]) r.usd_value = _usdMap[r.id]; });
      DEMO_REWARDS.splice(0, DEMO_REWARDS.length, ...realRewards);
    }
    if (realCoupons)      DEMO_COUPONS.splice(0, DEMO_COUPONS.length, ...realCoupons);
    if (realSubmissions) {
      // Re-hydrate chore/child references and restore photos from individual keys
      realSubmissions.forEach(s => {
        if (s.chore_id && (!s.chore || !s.chore.title)) s.chore = DEMO_CHORES.find(c => c.id === s.chore_id) || s.chore;
        if (s.child_id && (!s.child || !s.child.display_name)) s.child = DEMO_CHILDREN.find(c => c.id === s.child_id) || s.child;
        // Backfill child_id from child ref if missing (old submissions before the fix)
        if (!s.child_id && s.child?.id) s.child_id = s.child.id;
        if (s.photo_urls) {
          s.photo_urls = s.photo_urls.map(u => {
            if (u.startsWith('__photokey__')) {
              const key = u.replace('__photokey__', '');
              return localStorage.getItem(key) || '__photo__';
            }
            return u;
          });
        }
      });
      DEMO_SUBMISSIONS.splice(0, DEMO_SUBMISSIONS.length, ...realSubmissions);
    }
    if (realRedemptions)  DEMO_PENDING_REDEMPTIONS.splice(0, DEMO_PENDING_REDEMPTIONS.length, ...realRedemptions);
    if (realCpnRequests)  DEMO_COUPON_REQUESTS.splice(0, DEMO_COUPON_REQUESTS.length, ...realCpnRequests);
  }

  window._saveRealData = function() {
    // Save photos in a separate key so they don't bloat the submissions JSON.
    // Each submission's base64 urls are stored as fos_photo_<id>_<idx>.
    // The submission itself just holds the key reference so it can be looked up.
    const photoMap = {};
    const _subsSafe = DEMO_SUBMISSIONS.map(s => {
      const urls = s.photo_urls || [];
      const refs = urls.map((u, i) => {
        if (u.startsWith('data:')) {
          const key = 'fos_photo_' + s.id + '_' + i;
          photoMap[key] = u;
          return '__photokey__' + key;
        }
        return u;
      });
      return { ...s, photo_urls: refs };
    });
    try {
      // Save each photo individually so a single large photo doesn't kill the whole save
      Object.entries(photoMap).forEach(([k, v]) => {
        try { localStorage.setItem(k, v); } catch(e) { console.warn('Photo too large to cache:', k); }
      });
      localStorage.setItem('fos_real_family',        JSON.stringify(DEMO_FAMILY));
      localStorage.setItem('fos_real_children',      JSON.stringify(DEMO_CHILDREN));
      localStorage.setItem('fos_real_parents',       JSON.stringify(DEMO_PARENTS));
      localStorage.setItem('fos_real_layaway',       JSON.stringify(DEMO_LAYAWAY));
      localStorage.setItem('fos_real_parent_chores', JSON.stringify(DEMO_PARENT_CHORES));
      localStorage.setItem('fos_real_parent_tasks',  JSON.stringify(DEMO_PARENT_TASKS));
      localStorage.setItem('fos_real_chores',        JSON.stringify(DEMO_CHORES));
      localStorage.setItem('fos_real_rewards',       JSON.stringify(DEMO_REWARDS));
      localStorage.setItem('fos_real_coupons',       JSON.stringify(DEMO_COUPONS));
      localStorage.setItem('fos_real_submissions',   JSON.stringify(_subsSafe));
      localStorage.setItem('fos_real_redemptions',   JSON.stringify(DEMO_PENDING_REDEMPTIONS));
      localStorage.setItem('fos_real_cpn_requests',  JSON.stringify(DEMO_COUPON_REQUESTS));
      localStorage.setItem('fos_has_real_data',      '1');
      localStorage.setItem('fos_family',             JSON.stringify(DEMO_FAMILY));
    } catch(e) {
      console.warn('localStorage save failed:', e.message);
    }
  };

  window.DEMO_CHILDREN_DATA = DEMO_CHILDREN;
  window.DEMO_PARENTS_DATA  = DEMO_PARENTS;

  // Always regenerate instances on load — DEMO_INSTANCES is in-memory only
  generateDailyInstances();

  // Pre-seed default avatars so every child has one on first load
  if (window.DEMO_MODE) {
    const defaults = {
      'demo-child-001': 'robot',
      'demo-child-002': 'unicorn',
      'demo-child-003': 'fox',
      'demo-child-004': 'cat',
    };
    Object.entries(defaults).forEach(([id, key]) => {
      if (!localStorage.getItem('fos_avatar_' + id)) {
        localStorage.setItem('fos_avatar_' + id, key);
      }
    });
  }
})();
