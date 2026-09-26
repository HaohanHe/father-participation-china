# Father Participation in Family Education: Research Dataset and Analysis

[中文](#中文) ｜ [日本語](#日本語) ｜ [English](#english)

## 中文

本仓库存放的是「父亲参与家庭教育影响因素分析」课题的脱敏数据与配套分析代码。数据来自中国东部某区小学低年级家长问卷，共 1,788 份，其中父亲问卷 577 份、母亲问卷 1,211 份。研究围绕父亲参与家庭教育的 14 个变量（认知、家庭、工作、能力、社会五个维度）展开，重点分析工作压力与父亲参与之间的关系是否受单位政策支持调节。

### 数据概况

| 项目 | 说明 |
|------|------|
| 标题 | 父亲参与家庭教育的影响因素分析 |
| DOI | https://doi.org/10.5281/zenodo.19036285 |
| 完成年份 | 2026 |
| 作者 | 刘丽艳（ORCID: 0009-0008-0592-6853）、杨雅菲、王亚妮、张文丽 |
| 算法 | 何浩瀚（ORCID: 0009-0003-8064-2272） |
| 指导教师 | 刘丽艳 |
| 数据来源 | 中国东部某区小学家长调研 |

### 变量结构（5 维度 14 变量）

| 维度 | 变量数 | 内容 |
|------|-------|------|
| 认知 | 3 | 对家庭教育的认知、参与重要性感知 |
| 家庭 | 3 | 配偶态度、教育观念一致性 |
| 工作 | 2 | 工作压力影响、单位政策支持 |
| 能力 | 3 | 培训参与、自我效能感 |
| 社会 | 3 | 信息渠道、社区活动 |

### 目录结构

```
.
├── data_deidentified.xlsx       # 脱敏后数据（1,788 条）
├── deidentify_data.js           # 数据脱敏脚本（Node.js）
├── code/
│   ├── scientific_analysis.js   # 描述统计、相关、回归（Node.js）
│   ├── sem_analysis.js          # 结构方程模型路径分析（Node.js）
│   ├── deep_dive_analysis.js    # 深入分析（Node.js）
│   └── moderation_analysis.py   # 调节效应分析（Python）
├── reports/
│   ├── Moderation_Analysis_Report_English.docx
│   └── 调节效应分析报告_中文版.docx
├── figures/
│   ├── moderation_interaction_plot.png
│   ├── johnson_neyman_plot.png
│   └── moderation_scatter_plot.png
├── analysis_data/
│   ├── moderation_analysis_data.xlsx   # 调节效应分析用清洗数据
│   └── moderation_models.pkl           # 保存的回归模型
├── LICENSE                      # CC BY 4.0
└── CITATION.cff
```

### 运行方式

调节效应分析用 Python 跑，需要 pandas、numpy、statsmodels、scipy、matplotlib：

```bash
cd code
python moderation_analysis.py
```

三个 Node.js 脚本（`scientific_analysis.js`、`sem_analysis.js`、`deep_dive_analysis.js`）依赖 `xlsx` 包，在原始数据上运行过。脚本里写的是当年本机的 Windows 路径（`c:/Users/LENOVO/...`），仓库里只放了脱敏后的 `data_deidentified.xlsx`，复现时需要把脚本里的输入路径指到这个文件。

`deidentify_data.js` 是当年把原始问卷导出成脱敏数据的脚本，保留在这里供审计追溯，不需要再跑一遍。

### 主要发现

1. 认知水平和自我效能感是最强的预测因子（r = 0.448、0.423）。
2. 存在「学历悖论」：学历较低的父亲参与度反而更高。
3. 自我效能感中介了认知到参与之间 42.5% 的效应。
4. 夫妻观念一致性（r = 0.295）的影响约为配偶态度支持（r = 0.119）的 2.5 倍。
5. 调节效应：单位政策支持显著调节工作压力与父亲参与的关系（B = 0.230，p = 0.003，ΔR² = 0.015），起缓冲作用。低政策支持下，工作压力显著抑制参与（B = -0.277，p = 0.005）；中高支持水平下，负面效应减弱到不显著。

调节效应部分用了层次回归（Aiken & West, 1991；Hayes, 2018）、连续变量均值中心化、调节变量 ±1 SD 处的简单斜率分析、Johnson-Neyman 显著性区间，以及 5,000 次 bootstrap 稳健性检验。交互项 B = 0.230（SE = 0.077，β = 0.124，t(567) = 2.997，p = 0.003，95% CI [0.080, 0.381]），f² = 0.016，属于小效应。

### 数据脱敏说明

仓库中的 `data_deidentified.xlsx` 已经移除了：姓名与联系方式、IP 地址与提交时间戳、具体学校名称、详细职业信息，以及所有开放式题项的回答。

### 联系

- 第一作者：刘丽艳
- 邮箱：liuliyan@qut.edu.cn
- 单位：青岛理工大学

英文论文正在投稿中。

### 许可证

CC BY 4.0（知识共享署名 4.0 国际）。可以自由使用、修改和分发，需保留署名。

---

## 日本語

このリポジトリは、「父親の家庭教育参加に影響を与える要因の分析」プロジェクトの匿名化データと分析コードをまとめたものです。データは中国東部の小学校低学年の保護者を対象とした調査によるもので、有効票は1,788部、うち父親票577部、母親票1,211部です。父親の家庭教育参加を5つの次元（認知・家族・職業・能力・社会）にわたる14変数で測定し、とくに職場の政策的支援が仕事のストレスと父親参加の関係をどう調整するかを分析しています。

### データ概要

| 項目 | 説明 |
|------|------|
| タイトル | 父親の家庭教育参加に影響を与える要因の分析 |
| DOI | https://doi.org/10.5281/zenodo.19036285 |
| 作成年 | 2026 |
| 著者 | 劉艶艶（ORCID: 0009-0008-0592-6853）、楊雅菲、王亜妮、張文麗 |
| アルゴリズム | 何浩瀚（ORCID: 0009-0003-8064-2272） |
| 指導教員 | 劉艶艶 |
| データ出典 | 中国東部のある区の小学校保護者調査 |

### 変数構成（5次元14変数）

| 次元 | 変数数 | 内容 |
|------|-------|------|
| 認知 | 3 | 家庭教育に関する理解、参加の重要性認識 |
| 家族 | 3 | 配偶者の態度、教育観の一致 |
| 職業 | 2 | 仕事のストレス、職場の政策的支援 |
| 能力 | 3 | 研修参加、自己効力感 |
| 社会 | 3 | 情報チャネル、地域活動 |

### ディレクトリ構成

```
.
├── data_deidentified.xlsx       # 匿名化済みデータ（1,788件）
├── deidentify_data.js           # 匿名化スクリプト（Node.js）
├── code/
│   ├── scientific_analysis.js   # 記述統計・相関・回帰（Node.js）
│   ├── sem_analysis.js          # 構造方程式モデル（Node.js）
│   ├── deep_dive_analysis.js    # 深掘り分析（Node.js）
│   └── moderation_analysis.py   # 調整効果分析（Python）
├── reports/
│   ├── Moderation_Analysis_Report_English.docx
│   └── 调节效应分析报告_中文版.docx
├── figures/
│   ├── moderation_interaction_plot.png
│   ├── johnson_neyman_plot.png
│   └── moderation_scatter_plot.png
├── analysis_data/
│   ├── moderation_analysis_data.xlsx   # 調整効果分析用に整形したデータ
│   └── moderation_models.pkl           # 保存済み回帰モデル
├── LICENSE                      # CC BY 4.0
└── CITATION.cff
```

### 実行方法

調整効果分析は Python で実行します。pandas、numpy、statsmodels、scipy、matplotlib が必要です。

```bash
cd code
python moderation_analysis.py
```

Node.js 製の3本（`scientific_analysis.js`、`sem_analysis.js`、`deep_dive_analysis.js`）は `xlsx` パッケージに依存し、生データに対して実行されたものです。スクリプト内には当時の Windows 上のパス（`c:/Users/LENOVO/...`）がそのまま残っています。リポジトリには匿名化後の `data_deidentified.xlsx` だけを置いているので、再現する際は入力パスをこのファイルに書き換えてください。

`deidentify_data.js` は当時生データを匿名化データに変換したスクリプトで、監査トレース用に残しているだけで、再実行は想定していません。

### 主な知見

1. 認知水準と自己効力感が最も強い予測因子でした（r = 0.448、0.423）。
2. 「学歴パラドックス」が見られました。学歴の低い父親の方が参加度が高いという結果です。
3. 自己効力感が、認知から参加への経路の42.5%を媒介していました。
4. 配偶者との教育観の一致（r = 0.295）は、配偶者の態度的支援（r = 0.119）の約2.5倍の影響力を持っていました。
5. 調整効果：職場の政策的支援は、仕事のストレスと父親参加の関係を有意に調整していました（B = 0.230、p = 0.003、ΔR² = 0.015）。バッファーとして働き、支援が低い条件では仕事のストレスが参加を有意に下げ（B = -0.277、p = 0.005）、支援が中程度以上では負の効果は有意でなくなりました。

調整効果の分析では、階層的重回帰（Aiken & West, 1991；Hayes, 2018）、連続変数の平均中心化、調整変数の ±1 SD での単純傾向分析、Johnson-Neyman 法による有意領域の特定、5,000回の bootstrap による頑健性確認を行っています。交互作用項は B = 0.230（SE = 0.077、β = 0.124、t(567) = 2.997、p = 0.003、95% CI [0.080, 0.381]）、f² = 0.016 で、小さい効果量です。

### 匿名化について

リポジトリ内の `data_deidentified.xlsx` からは、氏名・連絡先、IPアドレス・回答送信時刻、具体的な学校名、詳細な職業情報、すべての自由記述回答を削除してあります。

### 連絡先

- 第一著者：劉艶艶
- メール：liuliyan@qut.edu.cn
- 所属：青島理工大学

英語論文は現在国際誌に投稿中です。

### ライセンス

CC BY 4.0（クリエイティブ・コモンズ 表示 4.0 国際）。表示を維持する限り、自由に使用・改変・再配布できます。

---

## English

This repository contains the de-identified dataset and analysis code for a study on factors that influence fathers' participation in family education. The data come from a survey of parents of lower-grade primary school students in Eastern China, with 1,788 valid responses in total: 577 from fathers and 1,211 from mothers. The study measures father involvement across 14 variables in five dimensions, with particular attention to whether workplace policy support moderates the link between work pressure and father participation.

### Dataset overview

| Item | Description |
|------|-------------|
| Title | Analysis of factors influencing fathers' participation in family education |
| DOI | https://doi.org/10.5281/zenodo.19036285 |
| Year | 2026 |
| Authors | Liu Liyan (ORCID: 0009-0008-0592-6853), Yang Yafei, Wang Yani, Zhang Wenli |
| Algorithm | He Haoran (ORCID: 0009-0003-8064-2272) |
| Supervisor | Liu Liyan |
| Source | Parent survey, primary schools in Eastern China |

### Variables (5 dimensions, 14 items)

| Dimension | Count | Content |
|-----------|-------|---------|
| Cognitive | 3 | Understanding of family education, perceived importance |
| Familial | 3 | Spousal attitude, consensus on educational values |
| Occupational | 2 | Work pressure, workplace policy support |
| Capability | 3 | Training participation, self-efficacy |
| Social | 3 | Information channels, community activities |

### Layout

```
.
├── data_deidentified.xlsx       # De-identified data (1,788 records)
├── deidentify_data.js           # De-identification script (Node.js)
├── code/
│   ├── scientific_analysis.js   # Descriptives, correlations, regression (Node.js)
│   ├── sem_analysis.js          # Structural equation path analysis (Node.js)
│   ├── deep_dive_analysis.js    # In-depth analysis (Node.js)
│   └── moderation_analysis.py  # Moderation effect analysis (Python)
├── reports/
│   ├── Moderation_Analysis_Report_English.docx
│   └── 调节效应分析报告_中文版.docx
├── figures/
│   ├── moderation_interaction_plot.png
│   ├── johnson_neyman_plot.png
│   └── moderation_scatter_plot.png
├── analysis_data/
│   ├── moderation_analysis_data.xlsx   # Cleaned data for the moderation model
│   └── moderation_models.pkl           # Saved regression models
├── LICENSE                      # CC BY 4.0
└── CITATION.cff
```

### How to run

The moderation analysis is in Python and needs pandas, numpy, statsmodels, scipy, and matplotlib:

```bash
cd code
python moderation_analysis.py
```

The three Node.js scripts (`scientific_analysis.js`, `sem_analysis.js`, `deep_dive_analysis.js`) depend on the `xlsx` package and were run against the raw survey export. They still point at a Windows path from the original machine (`c:/Users/LENOVO/...`). The repository only ships the de-identified file `data_deidentified.xlsx`, so to rerun them you need to repoint the input path to that file.

`deidentify_data.js` is the script that produced the de-identified export from the raw questionnaire file. It is kept here for audit trace and is not meant to be rerun.

### Key findings

1. Cognitive awareness and self-efficacy are the strongest predictors (r = 0.448 and 0.423).
2. An education-involvement paradox appears: fathers with less education report higher participation.
3. Self-efficacy mediates 42.5% of the cognition-to-participation path.
4. Spousal consensus on educational values (r = 0.295) carries about 2.5 times the weight of spousal attitudinal support (r = 0.119).
5. Workplace policy support significantly moderates the relationship between work pressure and father participation (B = 0.230, p = 0.003, ΔR² = 0.015), acting as a buffer. Under low support, work pressure significantly suppresses participation (B = -0.277, p = 0.005); at moderate or high support the negative effect shrinks to non-significance.

The moderation block uses hierarchical multiple regression (Aiken & West, 1991; Hayes, 2018), mean-centering of continuous variables, simple slopes at ±1 SD of the moderator, Johnson-Neyman regions of significance, and 5,000-replicate bootstrap checks. The interaction term is B = 0.230 (SE = 0.077, β = 0.124, t(567) = 2.997, p = 0.003, 95% CI [0.080, 0.381]), with f² = 0.016, a small effect.

### De-identification notes

The shipped `data_deidentified.xlsx` has removed names and contact details, IP addresses and submission timestamps, specific school names, detailed occupation information, and all open-ended responses.

### Contact

- First author: Liu Liyan
- Email: liuliyan@qut.edu.cn
- Institution: Qingdao University of Technology

The English paper is under submission to international journals.

### License

CC BY 4.0 (Creative Commons Attribution 4.0 International). You may use, modify, and redistribute the material with appropriate credit.
