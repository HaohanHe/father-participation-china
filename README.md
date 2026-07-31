# Father Participation in Family Education - Dataset

---

## Dataset Overview

| Item | Description |
|------|-------------|
| **Title** | Analysis of Factors Influencing Fathers' Participation in Family Education |
| **Dataset DOI** | [To be assigned - Zenodo] |
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
father-participation-china/
├── README.md                    # English documentation
├── README_CN.md                 # Chinese documentation
├── LICENSE                      # CC BY 4.0
├── CITATION.cff                 # Citation file
├── data_deidentified.xlsx       # De-identified data (1,788 records)
├── deidentify_data.js           # Data de-identification script
├── code/
│   ├── scientific_analysis.js   # Statistical analysis
│   ├── sem_analysis.js          # Structural equation modeling
│   ├── deep_dive_analysis.js    # In-depth analysis
│   └── moderation_analysis.py   # Moderation effect analysis (Python)
├── reports/
│   ├── Moderation_Analysis_Report_English.docx  # Full moderation report (English)
│   └── 调节效应分析报告_中文版.docx              # Full moderation report (Chinese)
├── figures/
│   ├── moderation_interaction_plot.png    # Interaction effect plot
│   ├── johnson_neyman_plot.png            # Johnson-Neyman regions of significance
│   └── moderation_scatter_plot.png        # Scatter plot by policy support level
└── analysis_data/
    ├── moderation_analysis_data.xlsx  # Cleaned data for moderation analysis
    └── moderation_models.pkl          # Saved regression models
```

---

## Key Findings

1. Cognitive awareness and self-efficacy are the strongest predictors (r = 0.448, 0.423)
2. Education-Involvement Paradox: Lower-educated fathers show higher participation rates
3. Mediation effect: Self-efficacy mediates 42.5% of cognition-participation relationship
4. Spousal consensus (r = 0.267) is 2.2x more influential than spousal support (r = 0.119)
5. **Moderation effect**: Workplace policy support significantly moderates the relationship between work pressure and father participation (B = 0.230, p = .003, ΔR² = .015). It functions as a buffer: at low policy support levels, work pressure significantly inhibits participation (B = -0.277, p = .005); at moderate/high support levels, the negative effect is attenuated to non-significance.

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
6. **Moderation Analysis**: Hierarchical regression, simple slope analysis, Johnson-Neyman technique, bootstrap robustness checks

---

## Moderation Analysis Details

We conducted a comprehensive moderation analysis examining whether workplace policy support moderates the relationship between work pressure and father participation in family education.

### Methods
- Hierarchical multiple regression (Aiken & West, 1991; Hayes, 2018)
- Mean-centering of continuous variables
- Simple slope analysis at ±1 SD of the moderator
- Johnson-Neyman regions of significance
- Bootstrap robustness checks (5,000 resamples)

### Key Results
- **Interaction effect**: B = 0.230, SE = 0.077, β = .124, t(567) = 2.997, p = .003, 95% CI [0.080, 0.381]
- **Effect size**: ΔR² = .015, f² = .016 (small effect)
- **Pattern**: Buffering interaction
  - Low support (-1 SD): Work pressure significantly reduces participation (B = -0.277, p = .005)
  - Moderate support (Mean): No significant relationship (B = -0.067, p = .354)
  - High support (+1 SD): No significant relationship (B = 0.142, p = .169)

### How to Run
```bash
cd code
python moderation_analysis.py
```

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

*For academic research use only*
