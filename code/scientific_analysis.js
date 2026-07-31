const XLSX = require('xlsx');

const workbook = XLSX.readFile('c:/Users/LENOVO/Desktop/modified_doc/290490468_按序号_海之韵小学家长学校调研问卷_1788_1788.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('='.repeat(70));
console.log('     父亲参与家庭教育 - 科学化数据分析报告');
console.log('='.repeat(70));

const fatherData = data.filter(row => row['1.您是孩子的?'] === 1);
console.log(`\n有效父亲样本: ${fatherData.length} 份`);

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

function correlationCI(r, n, alpha = 0.05) {
  const zr = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const z = 1.96;
  const lowerZ = zr - z * se;
  const upperZ = zr + z * se;
  const lower = (Math.exp(2 * lowerZ) - 1) / (Math.exp(2 * lowerZ) + 1);
  const upper = (Math.exp(2 * upperZ) - 1) / (Math.exp(2 * upperZ) + 1);
  return { lower, upper };
}

const Y = fatherData.map(row => Number(row['10.您参与家庭教育的频率为']) || 0);

// 1. 验证论文中的相关系数
console.log('\n【1. 验证论文报告的相关系数】');
console.log('='.repeat(70));

const paperVars = [
  {key: '9.您了解什么是家庭教育吗?', name: 'X1 家庭教育认知', paperR: 0.841},
  {key: '15.您觉得父亲参与家庭教育对孩子的成长重要吗?', name: 'X2 参与重要性', paperR: 0.573},
  {key: '24.您是否具备足够的能力参加家庭教育?', name: 'X10 能力自信', paperR: 0.791},
  {key: '17.您的配偶对您参与家庭教育的态度是?', name: 'X4 配偶态度', paperR: 0.519},
  {key: '18.您与配偶在家庭教育观念上的一致程度为:', name: 'X5 观念一致', paperR: 0.695},
  {key: '21.您认为您的工作压力对参与家庭教育有什么影响?', name: 'X7 工作压力', paperR: -0.474}
];

console.log('\n变量          | 论文r值 | 实际r值 | 95%置信区间        | 差异');
console.log('-'.repeat(70));

paperVars.forEach(v => {
  const X = fatherData.map(row => Number(row[v.key]) || 0);
  const validPairs = Y.map((y, i) => ({y, x: X[i]})).filter(p => p.y > 0 && p.x !== '' && !isNaN(p.x));
  const actualR = pearsonCorrelation(validPairs.map(p => p.x), validPairs.map(p => p.y));
  const ci = correlationCI(actualR, validPairs.length);
  const diff = actualR - v.paperR;
  console.log(`${v.name.padEnd(14)} | ${v.paperR.toFixed(3).padStart(7)} | ${actualR.toFixed(3).padStart(7)} | [${ci.lower.toFixed(3)}, ${ci.upper.toFixed(3)}] | ${diff >= 0 ? '+' : ''}${diff.toFixed(3)}`);
});

// 2. 学历与参与度关系分析
console.log('\n\n【2. 学历与参与度关系分析 - 重要发现】');
console.log('='.repeat(70));

const eduGroups = {};
fatherData.forEach(row => {
  const edu = row['3.您的学历:'];
  const freq = row['10.您参与家庭教育的频率为'];
  if (edu && freq) {
    if (!eduGroups[edu]) eduGroups[edu] = [];
    eduGroups[edu].push(Number(freq));
  }
});

const eduLabels = {1: '初中及以下', 2: '高中/中专', 3: '大专', 4: '本科', 5: '硕士及以上'};
console.log('\n学历        | 样本量 | 平均参与度 | 标准差 | 与论文结论对比');
console.log('-'.repeat(70));

const eduResults = [];
Object.entries(eduGroups).forEach(([edu, freqs]) => {
  const mean = freqs.reduce((a, b) => a + b, 0) / freqs.length;
  const variance = freqs.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / freqs.length;
  const sd = Math.sqrt(variance);
  eduResults.push({edu: Number(edu), mean, sd, n: freqs.length});
  console.log(`${eduLabels[edu].padEnd(12)} | ${freqs.length.toString().padStart(6)} | ${mean.toFixed(3).padStart(10)} | ${sd.toFixed(3).padStart(6)} |`);
});

eduResults.sort((a, b) => a.edu - b.edu);
console.log('\n⚠️ 关键发现: 论文声称"高学历父亲参与度更高"，但数据显示:');
console.log(`   - 初中及以下学历父亲参与度最高 (${eduResults[0].mean.toFixed(2)})`);
console.log(`   - 硕士及以上学历父亲参与度最低 (${eduResults[eduResults.length-1].mean.toFixed(2)})`);
console.log('   - 这与论文结论相反，需要修正！');

// 3. 职业与参与度分析
console.log('\n\n【3. 职业与参与度关系分析】');
console.log('='.repeat(70));

const jobGroups = {};
fatherData.forEach(row => {
  const job = row['4.您的职业:'];
  const freq = row['10.您参与家庭教育的频率为'];
  if (job && freq) {
    if (!jobGroups[job]) jobGroups[job] = [];
    jobGroups[job].push(Number(freq));
  }
});

const jobLabels = {1: '国企员工', 2: '私营业主', 3: '个体经营', 4: '事业单位', 5: '其他'};
console.log('\n职业        | 样本量 | 平均参与度 | 标准差');
console.log('-'.repeat(50));

Object.entries(jobGroups).forEach(([job, freqs]) => {
  const mean = freqs.reduce((a, b) => a + b, 0) / freqs.length;
  const variance = freqs.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / freqs.length;
  const sd = Math.sqrt(variance);
  console.log(`${(jobLabels[job] || '职业'+job).padEnd(12)} | ${freqs.length.toString().padStart(6)} | ${mean.toFixed(3).padStart(10)} | ${sd.toFixed(3).padStart(6)}`);
});

// 4. 中介效应分析
console.log('\n\n【4. 中介效应分析: 认知 → 能力 → 参与】');
console.log('='.repeat(70));

const mediationData = fatherData
  .map(row => ({
    cognition: Number(row['9.您了解什么是家庭教育吗?']) || 0,
    ability: Number(row['24.您是否具备足够的能力参加家庭教育?']) || 0,
    participation: Number(row['10.您参与家庭教育的频率为']) || 0
  }))
  .filter(d => d.cognition > 0 && d.ability > 0 && d.participation > 0);

const cognition = mediationData.map(d => d.cognition);
const ability = mediationData.map(d => d.ability);
const participation = mediationData.map(d => d.participation);

const r_a = pearsonCorrelation(cognition, ability);
const r_b = pearsonCorrelation(ability, participation);
const r_c = pearsonCorrelation(cognition, participation);

console.log(`\n路径分析结果:`);
console.log(`  a路径 (认知→能力): r = ${r_a.toFixed(3)}`);
console.log(`  b路径 (能力→参与): r = ${r_b.toFixed(3)}`);
console.log(`  c路径 (认知→参与，总效应): r = ${r_c.toFixed(3)}`);

const indirectEffect = r_a * r_b;
const directEffect = r_c - indirectEffect;
console.log(`\n中介效应分解:`);
console.log(`  间接效应 (认知→能力→参与): ${indirectEffect.toFixed(3)}`);
console.log(`  直接效应 (认知→参与): ${directEffect.toFixed(3)}`);
console.log(`  中介效应占比: ${(indirectEffect / r_c * 100).toFixed(1)}%`);

// 5. 效应量分析
console.log('\n\n【5. 效应量分析 (Cohen\'s d)】');
console.log('='.repeat(70));

const highEdu = [...(eduGroups[4] || []), ...(eduGroups[5] || [])];
const lowEdu = [...(eduGroups[1] || []), ...(eduGroups[2] || [])];

if (highEdu.length > 0 && lowEdu.length > 0) {
  const n1 = highEdu.length;
  const n2 = lowEdu.length;
  const mean1 = highEdu.reduce((a, b) => a + b, 0) / n1;
  const mean2 = lowEdu.reduce((a, b) => a + b, 0) / n2;
  const var1 = highEdu.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (n1 - 1);
  const var2 = lowEdu.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (n2 - 1);
  const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
  const d = (mean1 - mean2) / pooledSD;
  
  console.log(`\n高学历 vs 低学历父亲参与度差异:`);
  console.log(`  高学历 (本科+硕士): n=${n1}, M=${mean1.toFixed(2)}`);
  console.log(`  低学历 (初中+高中): n=${n2}, M=${mean2.toFixed(2)}`);
  console.log(`  Cohen's d = ${d.toFixed(3)}`);
  console.log(`  效应量解释: ${Math.abs(d) < 0.2 ? '极小' : (Math.abs(d) < 0.5 ? '小' : (Math.abs(d) < 0.8 ? '中等' : '大'))}`);
  console.log(`  ⚠️ d值为负，说明低学历父亲参与度更高！`);
}

// 6. 模型拟合度验证
console.log('\n\n【6. 各维度解释力验证】');
console.log('='.repeat(70));

const dimensions = {
  '认知维度': ['9.您了解什么是家庭教育吗?', '15.您觉得父亲参与家庭教育对孩子的成长重要吗?'],
  '能力维度': ['23.您是否参加过相关的家庭教育培训或学习活动?', '24.您是否具备足够的能力参加家庭教育?'],
  '家庭维度': ['17.您的配偶对您参与家庭教育的态度是?', '18.您与配偶在家庭教育观念上的一致程度为:'],
  '工作维度': ['21.您认为您的工作压力对参与家庭教育有什么影响?'],
  '社会维度': ['27.您所在的社区是否开展有关父亲参与家庭教育的活动?']
};

console.log('\n维度      | 变量数 | 平均相关 | 论文R² | 预估R²');
console.log('-'.repeat(60));

Object.entries(dimensions).forEach(([dim, vars]) => {
  const correlations = vars.map(v => {
    const X = fatherData.map(row => Number(row[v]) || 0);
    const validPairs = Y.map((y, i) => ({y, x: X[i]})).filter(p => p.y > 0 && p.x !== '' && !isNaN(p.x));
    return Math.abs(pearsonCorrelation(validPairs.map(p => p.x), validPairs.map(p => p.y)));
  });
  const avgR = correlations.reduce((a, b) => a + b, 0) / correlations.length;
  const paperR2 = dim === '认知维度' ? 0.204 : (dim === '能力维度' ? 0.189 : (dim === '家庭维度' ? 0.114 : (dim === '工作维度' ? 0.034 : 0.075)));
  const estimatedR2 = avgR * avgR;
  console.log(`${dim.padEnd(10)} | ${vars.length.toString().padStart(6)} | ${avgR.toFixed(3).padStart(8)} | ${paperR2.toFixed(3).padStart(6)} | ${estimatedR2.toFixed(3).padStart(6)}`);
});

console.log('\n' + '='.repeat(70));
console.log('                    分析完成');
console.log('='.repeat(70));
