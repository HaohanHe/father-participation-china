# Father Participation in Family Education - Dataset

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.19036286.svg)](https://doi.org/10.5281/zenodo.19036286)
---

## Dataset Overview

| Item | Description |
|------|-------------|
| **Title** | Analysis of Factors Influencing Fathers' Participation in Family Education |
| **Dataset DOI** | [(https://doi.org/10.5281/zenodo.19036286)] |
| **Created** | 2026 |
| **Authors** | Liu Liyan (ORCID: 0009-0008-0592-6853), Yang Yafei, Wang Yani, Zhang Wenli |
| **Algorithm Author** | He Haoran (ORCID: 0009-0003-8064-2272) |
| **Supervisor** | Liu Liyan |
| **Data Source** | Survey of parents, Eastern China |

### Sample Size

- Father questionnaires: 577
- Mother questionnaires: 1,211
- **Total: 1,788**

### Research Variables (14 variables across 5 dimensions)

| Dimension | Variables | Description |
|-----------|-----------|-------------|
| Cognitive | 3 | Understanding of family education, perceived importance |
| Familial | 3 | Spousal attitude, educational values consensus |
| Occupational | 2 | Work pressure impact, workplace policy support |
| Capability | 3 | Training participation, self-efficacy |
| Social | 3 | Information channels, community activities |

---

## File Structure

```
father_education_data/
├── README.md              # English
├── README_CN.md          # Chinese
├── LICENSE               # CC BY 4.0
├── data/
│   └── data_deidentified.xlsx  # De-identified data (1,788 records)
└── code/
    ├── scientific_analysis.js  # Statistical analysis
    ├── sem_analysis.js         # Structural equation modeling
    └── deep_dive_analysis.js   # In-depth analysis
```

---

## Key Findings

1. Cognitive awareness and self-efficacy are the strongest predictors (r = 0.448, 0.423)
2. Education-Involvement Paradox: Lower-educated fathers show higher participation rates
3. Mediation effect: Self-efficacy mediates 42.5% of cognition-participation relationship
4. Spousal consensus (r = 0.267) is 2.2x more influential than spousal support (r = 0.119)

---

## Data De-identification

The following sensitive information has been removed:
- Personal identity information (names, contact)
- IP addresses, submission timestamps
- Specific school names
- Detailed occupation information
- Open-ended responses

---

## Analytical Methods

1. Descriptive Statistics: Mean, SD, frequency
2. Correlation Analysis: Pearson r with 95% CI
3. Multiple Regression: Standardized coefficients
4. Mediation Analysis: Baron and Kenny approach
5. Effect Size: Cohen's d, R-squared

---

## Usage License

CC BY 4.0 - Creative Commons Attribution 4.0 International

You can freely use, modify, and distribute with attribution.

---

## Related Paper

English paper is under submission to international journals.

---

## Contact

- First Author: Liu Liyan
- Email: liuliyan@qut.edu.cn
- Institution: Qingdao University of Technology

---

For academic research use only
