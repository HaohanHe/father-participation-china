const XLSX = require('xlsx');

const workbook = XLSX.readFile('c:/Users/LENOVO/Desktop/modified_doc/290490468_按序号_海之韵小学家长学校调研问卷_1788_1788.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('开始数据脱敏处理...');

const sensitiveFields = [
  '序号',
  '提交答卷时间',
  '所用时间', 
  '来源',
  '来源详情',
  '来自IP',
  '1.您对学校的校风情况是否满意?  ',
  '2.您对学校教材教辅管理工作是否满意?    ',
  '3.您孩子的教师向您推销或强制订阅过课外辅导资料吗?',
  '4.您对学校规范收费工作是否满意?      ',
  '5.您对学生午餐的饭菜质量是否满意?     ',
  '6.您认为孩子的课业负担: ',
  '7.您孩子在上学期间，每天睡眠多长时间?（小学生睡眠时间要求每天合计不低于10小时，包括学生午休大约1小时）',
  '8．关于手机（包括电话手表）的使用，您的孩子是以下哪种情况?:',
  '9.您对学校师德师风建设工作是否满意?  ',
  '10.您觉得您孩子的班主任事业心、责任心:',
  '11.您觉得孩子与任课老师之间的关系:',
  '12.您孩子的任课教师对孩子是否有体罚或变相体罚行为（是哪个学科教师有这种行为?  ）:',
  '13.据您所知，我校教师是否存在有偿家教现象?',
  '14．您孩子的任课教师是否及时批改作业:',
  '15.落实"双减"政策以来，您的孩子是否利用周末、假期时间参加过校外学科补习班?',
  '16.您对学校的管理及发展有什么建议?',
  '17.您对班主任的班级管理有什么建议?',
  '18.您对任课教师的教学有什么建议?',
  '16.您对学校的管理及发展有什么建议?',
  '35.您对于父亲家庭教育能力提升方面还有哪些需求?'
];

const deidentifiedData = data.map((row, index) => {
  const newRow = { ...row };
  
  sensitiveFields.forEach(field => {
    if (field in newRow) {
      delete newRow[field];
    }
  });
  
  delete newRow['2.您的年龄:'];
  delete newRow['3.您的学历:'];
  delete newRow['4.您的职业:'];
  delete newRow['5.家庭年收入总数:'];
  delete newRow['6.家中孩子的数量:'];
  delete newRow['7.家中孩子的性别:'];
  delete newRow['1.孩子所在的年级是:'];
  delete newRow['2.孩子所在的班级是:'];
  
  if (newRow['1.您是孩子的?'] === 1) {
    newRow[' Respondent_Type'] = 'Father';
  } else if (newRow['1.您是孩子的?'] === 2) {
    newRow[' Respondent_Type'] = 'Mother';
  }
  
  delete newRow['1.您是孩子的?'];
  
  Object.keys(newRow).forEach(key => {
    if (newRow[key] === '' || newRow[key] === undefined || newRow[key] === null) {
      delete newRow[key];
    }
    if (typeof newRow[key] === 'string' && newRow[key].includes('（')) {
      const match = newRow[key].match(/^(\d+)/);
      if (match) {
        newRow[key] = parseInt(match[1]);
      }
    }
  });
  
  return newRow;
});

const outputPath = 'c:/Users/LENOVO/Desktop/modified_doc/zenodo_upload/data_deidentified.xlsx';
const outputWB = XLSX.utils.book_new();
const outputWS = XLSX.utils.json_to_sheet(deidentifiedData);
XLSX.utils.book_append_sheet(outputWB, outputWS, 'Survey Data');
XLSX.writeFile(outputWB, outputPath);

console.log('数据脱敏完成！');
console.log(`输出文件: ${outputPath}`);
console.log(`总记录数: ${deidentifiedData.length}`);
