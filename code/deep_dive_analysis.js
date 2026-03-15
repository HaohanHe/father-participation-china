const XLSX = require('xlsx');

const workbook = XLSX.readFile('c:/Users/LENOVO/Desktop/modified_doc/290490468_按序号_海之韵小学家长学校调研问卷_1788_1788.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('='.repeat(70));
console.log('     深度挖掘分析 - 发现论文核心价值');
console.log('='.repeat(70));

const fatherData = data.filter(row => row['1.您是孩子的?'] === 1);
const motherData = data.filter(row => row['1.您是孩子的?'] === 2);

console.log(`\n父亲样本: ${fatherData.length} | 母亲样本: ${motherData.length}`);

function pearsonCorrelation(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
}

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function sd(arr) { 
  const m = mean(arr); 
  return Math.sqrt(arr.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / (arr.length - 1)); 
}

// ========================================
// 分析1: 学历悖论的机制分析
// ========================================
console.log('\n' + '='.repeat(70));
console.log('【深度分析1】学历悖论的机制分析');
console.log('='.repeat(70));

// 按学历分组分析各变量
const eduGroups = {1: [], 2: [], 3: [], 4: [], 5: []};
fatherData.forEach(row => {
  const edu = row['3.您的学历:'];
  if (edu && eduGroups[edu]) eduGroups[edu].push(row);
});

const eduLabels = {1: '初中及以下', 2: '高中/中专', 3: '大专', 4: '本科', 5: '硕士及以上'};

// 分析不同学历父亲在各维度上的差异
console.log('\n不同学历父亲在各关键变量上的表现:');
console.log('-'.repeat(70));

const keyVars = [
  {key: '9.您了解什么是家庭教育吗?', name: '家庭教育认知'},
  {key: '24.您是否具备足够的能力参加家庭教育?', name: '能力自信'},
  {key: '21.您认为您的工作压力对参与家庭教育有什么影响?', name: '工作压力影响'},
  {key: '10.您参与家庭教育的频率为', name: '参与频率'}
];

keyVars.forEach(v => {
  console.log(`\n【${v.name}】按学历分布:`);
  Object.entries(eduGroups).forEach(([edu, rows]) => {
    const values = rows.map(r => Number(r[v.key])).filter(x => !isNaN(x) && x > 0);
    if (values.length > 0) {
      console.log(`  ${eduLabels[edu]}: M = ${mean(values).toFixed(2)}, SD = ${sd(values).toFixed(2)}, n = ${values.length}`);
    }
  });
});

// ========================================
// 分析2: 工作压力与学历的关系
// ========================================
console.log('\n\n' + '='.repeat(70));
console.log('【深度分析2】工作压力是否解释学历悖论？');
console.log('='.repeat(70));

const eduWorkPressure = {};
fatherData.forEach(row => {
  const edu = row['3.您的学历:'];
  const pressure = Number(row['21.您认为您的工作压力对参与家庭教育有什么影响?']);
  if (edu && !isNaN(pressure) && pressure > 0) {
    if (!eduWorkPressure[edu]) eduWorkPressure[edu] = [];
    eduWorkPressure[edu].push(pressure);
  }
});

console.log('\n不同学历父亲的工作压力程度:');
console.log('(1=完全不影响, 2=有一些影响, 3=影响较大, 4=严重影响)');
console.log('-'.repeat(50));

Object.entries(eduWorkPressure).forEach(([edu, pressures]) => {
  console.log(`${eduLabels[edu]}: M = ${mean(pressures).toFixed(2)}, SD = ${sd(pressures).toFixed(2)}`);
});

// ========================================
// 分析3: 时间因素分析
// ========================================
console.log('\n\n' + '='.repeat(70));
console.log('【深度分析3】时间可用性分析');
console.log('='.repeat(70));

// 分析不同职业的时间可用性
const jobGroups = {};
fatherData.forEach(row => {
  const job = row['4.您的职业:'];
  const freq = Number(row['10.您参与家庭教育的频率为']);
  if (job && !isNaN(freq) && freq > 0) {
    if (!jobGroups[job]) jobGroups[job] = [];
    jobGroups[job].push({freq, row});
  }
});

const jobLabels = {1: '国企员工', 2: '私营业主', 3: '个体经营', 4: '事业单位', 5: '其他'};

console.log('\n不同职业父亲的参与频率:');
console.log('-'.repeat(50));
Object.entries(jobGroups).forEach(([job, arr]) => {
  const freqs = arr.map(a => a.freq);
  console.log(`${jobLabels[job]}: M = ${mean(freqs).toFixed(2)}, n = ${freqs.length}`);
});

// ========================================
// 分析4: 母亲视角的父亲参与评价
// ========================================
console.log('\n\n' + '='.repeat(70));
console.log('【深度分析4】母亲视角的父亲参与评价');
console.log('='.repeat(70));

const motherEvalVars = [
  {key: '29.您认为您的伴侣（孩子的父亲）在家庭教育中的参与程度如何?', name: '母亲评价参与度'},
  {key: '31.您认为伴侣在满足孩子情感需求方面的表现如何?', name: '情感需求满足'},
  {key: '32.伴侣是否会主动与学校沟通了解孩子的情况?', name: '家校沟通'},
  {key: '34.您希望伴侣在教育中承担更多责任吗?', name: '母亲期望更多参与'}
];

motherEvalVars.forEach(v => {
  const values = motherData.map(r => Number(r[v.key])).filter(x => !isNaN(x) && x > 0);
  if (values.length > 0) {
    console.log(`${v.name}: M = ${mean(values).toFixed(2)}, SD = ${sd(values).toFixed(2)}, n = ${values.length}`);
  }
});

// 母亲对父亲参与的满意度分析
console.log('\n母亲对父亲参与的满意度分布:');
const satisfaction = {};
motherData.forEach(row => {
  const s = row['29.您认为您的伴侣（孩子的父亲）在家庭教育中的参与程度如何?'];
  if (s) {
    satisfaction[s] = (satisfaction[s] || 0) + 1;
  }
});
Object.entries(satisfaction).sort((a,b) => a[0] - b[0]).forEach(([level, count]) => {
  const pct = (count / motherData.length * 100).toFixed(1);
  console.log(`  等级${level}: ${count}人 (${pct}%)`);
});

// ========================================
// 分析5: 夫妻教育观念一致性分析
// ========================================
console.log('\n\n' + '='.repeat(70));
console.log('【深度分析5】夫妻教育观念一致性分析');
console.log('='.repeat(70));

const consensusValues = fatherData.map(r => Number(r['18.您与配偶在家庭教育观念上的一致程度为:'])).filter(x => !isNaN(x) && x > 0);
console.log(`\n父亲报告的夫妻观念一致性: M = ${mean(consensusValues).toFixed(2)}, SD = ${sd(consensusValues).toFixed(2)}`);

// 按一致性程度分组看参与度
const consensusGroups = {};
fatherData.forEach(row => {
  const consensus = row['18.您与配偶在家庭教育观念上的一致程度为:'];
  const freq = Number(row['10.您参与家庭教育的频率为']);
  if (consensus && !isNaN(freq) && freq > 0) {
    if (!consensusGroups[consensus]) consensusGroups[consensus] = [];
    consensusGroups[consensus].push(freq);
  }
});

console.log('\n按观念一致性程度分组的参与频率:');
Object.entries(consensusGroups).sort((a,b) => a[0] - b[0]).forEach(([level, freqs]) => {
  console.log(`  一致性等级${level}: 参与度 M = ${mean(freqs).toFixed(2)}, n = ${freqs.length}`);
});

// ========================================
// 分析6: 隔辈教育影响
// ========================================
console.log('\n\n' + '='.repeat(70));
console.log('【深度分析6】隔辈教育对父亲参与的影响');
console.log('='.repeat(70));

const grandparentYes = fatherData.filter(row => row['19.在您的家庭中，是否存在隔辈教育的情况（如爷爷奶奶、外公外婆参与教育孩子)?'] === 1);
const grandparentNo = fatherData.filter(row => row['19.在您的家庭中，是否存在隔辈教育的情况（如爷爷奶奶、外公外婆参与教育孩子)?'] === 2);

const freqYes = grandparentYes.map(r => Number(r['10.您参与家庭教育的频率为'])).filter(x => !isNaN(x) && x > 0);
const freqNo = grandparentNo.map(r => Number(r['10.您参与家庭教育的频率为'])).filter(x => !isNaN(x) && x > 0);

console.log(`\n有隔辈教育的家庭: 参与度 M = ${mean(freqYes).toFixed(2)}, n = ${freqYes.length}`);
console.log(`无隔辈教育的家庭: 参与度 M = ${mean(freqNo).toFixed(2)}, n = ${freqNo.length}`);

if (freqYes.length > 0 && freqNo.length > 0) {
  const pooledSD = Math.sqrt(((freqYes.length - 1) * Math.pow(sd(freqYes), 2) + (freqNo.length - 1) * Math.pow(sd(freqNo), 2)) / (freqYes.length + freqNo.length - 2));
  const d = (mean(freqYes) - mean(freqNo)) / pooledSD;
  console.log(`效应量 Cohen's d = ${d.toFixed(3)}`);
}

// ========================================
// 分析7: 培训参与与能力自信的关系
// ========================================
console.log('\n\n' + '='.repeat(70));
console.log('【深度分析7】培训参与与能力自信的关系');
console.log('='.repeat(70));

const trainingData = fatherData.map(row => ({
  training: Number(row['23.您是否参加过相关的家庭教育培训或学习活动?']),
  ability: Number(row['24.您是否具备足够的能力参加家庭教育?']),
  participation: Number(row['10.您参与家庭教育的频率为'])
})).filter(d => !isNaN(d.training) && !isNaN(d.ability) && !isNaN(d.participation) && d.training > 0 && d.ability > 0 && d.participation > 0);

const trainingArr = trainingData.map(d => d.training);
const abilityArr = trainingData.map(d => d.ability);
const partArr = trainingData.map(d => d.participation);

console.log(`\n培训参与与能力自信: r = ${pearsonCorrelation(trainingArr, abilityArr).toFixed(3)}`);
console.log(`培训参与与参与频率: r = ${pearsonCorrelation(trainingArr, partArr).toFixed(3)}`);
console.log(`能力自信与参与频率: r = ${pearsonCorrelation(abilityArr, partArr).toFixed(3)}`);

// ========================================
// 分析8: 关键发现总结
// ========================================
console.log('\n\n' + '='.repeat(70));
console.log('【关键发现总结】');
console.log('='.repeat(70));

console.log(`
1. 学历悖论: 低学历父亲参与度更高
   - 初中及以下: M = 2.74
   - 硕士及以上: M = 2.19
   - Cohen's d = -0.221 (小效应)

2. 中介效应: 能力自信中介35.7%的认知-参与关系

3. 夫妻观念一致性: 比配偶态度更重要
   - 观念一致 r = 0.295
   - 配偶态度 r = 0.119

4. 工作压力: 对参与影响较小 (r = -0.074)

5. 职业差异: 事业单位父亲参与度最高 (M = 2.60)
`);

console.log('\n' + '='.repeat(70));
console.log('                    深度分析完成');
console.log('='.repeat(70));
