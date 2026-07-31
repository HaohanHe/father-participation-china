"""
调节效应分析脚本
Moderation Effect Analysis Script

分析工作场所政策支持对工作压力与父亲家庭教育参与关系的调节效应

用法: python moderation_analysis.py
"""

import pandas as pd
import numpy as np
import statsmodels.api as sm
from scipy import stats
import matplotlib.pyplot as plt
import matplotlib
import pickle
import os

# 设置中文字体（如果需要）
try:
    matplotlib.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
    matplotlib.rcParams['axes.unicode_minus'] = False
except:
    pass

# ========== 1. 数据加载与预处理 ==========
def load_and_preprocess_data(file_path, sheet_name=0):
    """
    加载并预处理数据
    
    Parameters
    ----------
    file_path : str
        数据文件路径
    sheet_name : str or int
        工作表名称或索引
    
    Returns
    -------
    DataFrame
        清洗后的分析数据
    """
    # 读取数据
    df = pd.read_excel(file_path, sheet_name=sheet_name)
    
    # 筛选父亲样本（第45列，0-based index = 44）
    # 注意：根据实际数据调整列索引
    father_col = 44  # 第45列
    df_father = df[df.iloc[:, father_col] == 1].copy()
    
    print(f"总样本数: {len(df)}")
    print(f"父亲样本数: {len(df_father)}")
    
    return df_father

def extract_variables(df):
    """
    提取分析变量
    
    Parameters
    ----------
    df : DataFrame
        原始数据
    
    Returns
    -------
    DataFrame
        包含Y, X, W和控制变量的数据框
    """
    # 注意：以下列索引需要根据实际数据调整
    # 参与频率（第54列，0-based = 53）
    Y_raw = df.iloc[:, 53].astype(float)
    
    # 工作压力影响（第94列，0-based = 93）
    X_raw = df.iloc[:, 93].astype(float)
    
    # 政策支持（第95-98列，多选题，0-based = 94-97）
    W_raw = df.iloc[:, 94:98].notna().sum(axis=1)
    # 如果选了"无任何支持"（第99列，0-based = 98），则为0
    no_support = df.iloc[:, 98].notna()
    W_raw[no_support] = 0
    
    # 控制变量
    age = df.iloc[:, 45].astype(float)  # 第46列
    edu = df.iloc[:, 46].astype(float)  # 第47列
    income = df.iloc[:, 48].astype(float)  # 第49列
    children = df.iloc[:, 49].astype(float)  # 第50列
    
    # 反转编码：Y（参与频率）- 原始1=经常,5=从不 → 反转后1=从不,5=经常
    Y = 6 - Y_raw
    
    # 反转编码：X（工作压力影响）- 原始1=压力大,3=影响不大 → 反转后1=影响小,3=影响大
    X = 4 - X_raw
    X[X_raw == 4] = np.nan  # "其他"设为缺失
    
    # 组装数据
    data = pd.DataFrame({
        'Y': Y,
        'X': X,
        'W': W_raw.astype(float),
        'age': age,
        'edu': edu,
        'income': income,
        'children': children
    })
    
    # 去除缺失值
    data = data.dropna()
    
    print(f"\n有效分析样本数: {len(data)}")
    print(f"\n描述统计:")
    print(data.describe().round(3))
    
    return data

# ========== 2. 调节效应分析 ==========
def moderation_analysis(data):
    """
    进行调节效应分析
    
    Parameters
    ----------
    data : DataFrame
        分析数据
    
    Returns
    -------
    dict
        分析结果
    """
    # 均值中心化
    X_mean = data['X'].mean()
    W_mean = data['W'].mean()
    
    data['X_c'] = data['X'] - X_mean
    data['W_c'] = data['W'] - W_mean
    data['XW'] = data['X_c'] * data['W_c']
    
    # 层次回归
    # Model 1: 控制变量
    X1 = sm.add_constant(data[['age', 'edu', 'income', 'children']])
    model1 = sm.OLS(data['Y'], X1).fit()
    
    # Model 2: + 主效应
    X2 = sm.add_constant(data[['age', 'edu', 'income', 'children', 'X_c', 'W_c']])
    model2 = sm.OLS(data['Y'], X2).fit()
    
    # Model 3: + 交互项
    X3 = sm.add_constant(data[['age', 'edu', 'income', 'children', 'X_c', 'W_c', 'XW']])
    model3 = sm.OLS(data['Y'], X3).fit()
    
    # 计算ΔR²
    delta_R2_1 = model2.rsquared - model1.rsquared
    delta_R2_2 = model3.rsquared - model2.rsquared
    
    # F检验ΔR²
    n = len(data)
    k1 = model1.df_model + 1
    k2 = model2.df_model + 1
    k3 = model3.df_model + 1
    
    F_delta1 = (delta_R2_1 / (k2 - k1)) / ((1 - model2.rsquared) / (n - k2))
    F_delta2 = (delta_R2_2 / (k3 - k2)) / ((1 - model3.rsquared) / (n - k3))
    
    p_delta1 = 1 - stats.f.cdf(F_delta1, k2 - k1, n - k2)
    p_delta2 = 1 - stats.f.cdf(F_delta2, k3 - k2, n - k3)
    
    # 简单斜率分析
    W_std = data['W'].std()
    X_std = data['X'].std()
    y_std = data['Y'].std()
    
    b1 = model3.params['X_c']
    b3 = model3.params['XW']
    se_b1 = model3.bse['X_c']
    se_b3 = model3.bse['XW']
    cov_b1_b3 = model3.cov_params().loc['X_c', 'XW']
    
    levels = {
        'Low (-1 SD)': W_mean - W_std,
        'Mean': W_mean,
        'High (+1 SD)': W_mean + W_std,
    }
    
    simple_slopes = {}
    for name, w_val in levels.items():
        w_centered = w_val - W_mean
        slope = b1 + b3 * w_centered
        se_slope = np.sqrt(se_b1**2 + w_centered**2 * se_b3**2 + 2 * w_centered * cov_b1_b3)
        t_slope = slope / se_slope
        df_resid = model3.df_resid
        p_slope = 2 * (1 - stats.t.cdf(abs(t_slope), df_resid))
        ci_lower = slope - 1.96 * se_slope
        ci_upper = slope + 1.96 * se_slope
        
        simple_slopes[name] = {
            'slope': slope,
            'se': se_slope,
            't': t_slope,
            'p': p_slope,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper
        }
    
    # Johnson-Neyman 区间
    t_crit = stats.t.ppf(0.975, model3.df_resid)
    
    # 解方程: (b1 + b3*w)^2 = t_crit^2 * (se_b1^2 + w^2*se_b3^2 + 2*w*cov_b1_b3)
    # 这是一个二次方程，用数值方法求解
    w_range = np.linspace(data['W'].min(), data['W'].max(), 1000)
    w_centered_range = w_range - W_mean
    
    slopes = b1 + b3 * w_centered_range
    ses = np.sqrt(se_b1**2 + w_centered_range**2 * se_b3**2 + 2 * w_centered_range * cov_b1_b3)
    t_vals = slopes / ses
    
    # 找到t值等于±t_crit的位置
    sign_changes = np.where(np.diff(np.sign(np.abs(t_vals) - t_crit)))[0]
    
    jn_points = []
    for idx in sign_changes:
        # 线性插值找精确位置
        w1 = w_range[idx]
        w2 = w_range[idx + 1]
        val1 = np.abs(t_vals[idx]) - t_crit
        val2 = np.abs(t_vals[idx + 1]) - t_crit
        w_jn = w1 + (t_crit - np.abs(t_vals[idx])) * (w2 - w1) / (t_vals[idx+1] - t_vals[idx])
        jn_points.append(w_jn)
    
    # 效应量
    f2 = delta_R2_2 / (1 - model3.rsquared)
    
    # VIF
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    vif_data = pd.DataFrame()
    vif_data['variable'] = X3.columns
    vif_data['VIF'] = [variance_inflation_factor(X3.values, i) for i in range(X3.shape[1])]
    
    results = {
        'model1': model1,
        'model2': model2,
        'model3': model3,
        'delta_R2_1': delta_R2_1,
        'delta_R2_2': delta_R2_2,
        'F_delta1': F_delta1,
        'F_delta2': F_delta2,
        'p_delta1': p_delta1,
        'p_delta2': p_delta2,
        'simple_slopes': simple_slopes,
        'jn_points': jn_points,
        'f2': f2,
        'vif': vif_data,
        'X_mean': X_mean,
        'W_mean': W_mean,
        'X_std': X_std,
        'W_std': W_std,
        'y_std': y_std,
        'data': data
    }
    
    return results

# ========== 3. 结果输出 ==========
def print_results(results):
    """
    打印分析结果
    
    Parameters
    ----------
    results : dict
        分析结果
    """
    print("\n" + "="*60)
    print("调节效应分析结果")
    print("="*60)
    
    print("\n【层次回归结果】")
    print(f"Model 1 (控制变量): R² = {results['model1'].rsquared:.3f}, "
          f"F = {results['model1'].fvalue:.3f}, p = {results['model1'].f_pvalue:.4f}")
    print(f"Model 2 (+主效应): R² = {results['model2'].rsquared:.3f}, "
          f"ΔR² = {results['delta_R2_1']:.3f}, F(Δ) = {results['F_delta1']:.3f}, p = {results['p_delta1']:.4f}")
    print(f"Model 3 (+交互项): R² = {results['model3'].rsquared:.3f}, "
          f"ΔR² = {results['delta_R2_2']:.3f}, F(Δ) = {results['F_delta2']:.3f}, p = {results['p_delta2']:.4f}")
    
    print("\n【交互项详情】")
    b3 = results['model3'].params['XW']
    se_b3 = results['model3'].bse['XW']
    t_b3 = results['model3'].tvalues['XW']
    p_b3 = results['model3'].pvalues['XW']
    ci = results['model3'].conf_int().loc['XW']
    
    print(f"  B = {b3:.3f}, SE = {se_b3:.3f}")
    print(f"  t = {t_b3:.3f}, p = {p_b3:.4f}")
    print(f"  95% CI = [{ci[0]:.3f}, {ci[1]:.3f}]")
    
    if p_b3 < 0.001:
        sig = '***'
    elif p_b3 < 0.01:
        sig = '**'
    elif p_b3 < 0.05:
        sig = '*'
    else:
        sig = 'ns'
    print(f"  显著性: {sig}")
    
    print("\n【简单斜率分析】")
    for name, ss in results['simple_slopes'].items():
        if ss['p'] < 0.001:
            sig = '***'
        elif ss['p'] < 0.01:
            sig = '**'
        elif ss['p'] < 0.05:
            sig = '*'
        else:
            sig = 'ns'
        print(f"  {name}: B = {ss['slope']:.3f}, SE = {ss['se']:.3f}, "
              f"t = {ss['t']:.3f}, p = {ss['p']:.4f} {sig}")
    
    print("\n【Johnson-Neyman 显著性区间】")
    if len(results['jn_points']) >= 2:
        print(f"  临界点1: W = {results['jn_points'][0]:.3f}")
        print(f"  临界点2: W = {results['jn_points'][1]:.3f}")
        print(f"  显著区间: W < {results['jn_points'][0]:.3f} 或 W > {results['jn_points'][1]:.3f}")
        print(f"  不显著区间: {results['jn_points'][0]:.3f} ≤ W ≤ {results['jn_points'][1]:.3f}")
    else:
        print("  未找到明确的显著性区间临界点")
    
    print("\n【效应量】")
    print(f"  ΔR² = {results['delta_R2_2']:.3f}")
    print(f"  Cohen's f² = {results['f2']:.3f}")
    if results['f2'] < 0.02:
        print(f"  效应量判断: 极小效应")
    elif results['f2'] < 0.15:
        print(f"  效应量判断: 小效应")
    elif results['f2'] < 0.35:
        print(f"  效应量判断: 中等效应")
    else:
        print(f"  效应量判断: 大效应")
    
    print("\n【多重共线性检验 (VIF)】")
    print(results['vif'].to_string(index=False))
    
    print("\n" + "="*60)

# ========== 4. 可视化 ==========
def plot_interaction(results, save_path='moderation_interaction_plot.png'):
    """
    绘制交互效应图
    
    Parameters
    ----------
    results : dict
        分析结果
    save_path : str
        保存路径
    """
    data = results['data']
    model3 = results['model3']
    W_mean = results['W_mean']
    X_mean = results['X_mean']
    
    fig, ax = plt.subplots(figsize=(10, 7))
    
    x_vals = np.linspace(data['X'].min(), data['X'].max(), 100)
    
    colors = ['#d62728', '#2ca02c', '#1f77b4']
    linestyles = ['--', '-', '-.']
    
    b0 = model3.params['const']
    b1 = model3.params['X_c']
    b2 = model3.params['W_c']
    b3 = model3.params['XW']
    
    control_effect = (model3.params['age'] * data['age'].mean() + 
                       model3.params['edu'] * data['edu'].mean() + 
                       model3.params['income'] * data['income'].mean() + 
                       model3.params['children'] * data['children'].mean())
    
    for i, (name, ss) in enumerate(results['simple_slopes'].items()):
        if name == 'Low (-1 SD)':
            w_val = W_mean - results['W_std']
        elif name == 'Mean':
            w_val = W_mean
        else:
            w_val = W_mean + results['W_std']
        
        w_centered = w_val - W_mean
        y_vals = b0 + control_effect + b1 * (x_vals - X_mean) + b2 * w_centered + b3 * (x_vals - X_mean) * w_centered
        
        sig_label = '*' if ss['p'] < 0.05 else 'ns'
        
        ax.plot(x_vals, y_vals, color=colors[i], linestyle=linestyles[i], 
                linewidth=2.5, label=f'{name} ({sig_label})')
    
    ax.set_xlabel('Work Pressure (X)', fontsize=13, fontweight='bold')
    ax.set_ylabel('Father Participation Frequency (Y)', fontsize=13, fontweight='bold')
    ax.set_title('Moderation Effect of Workplace Policy Support\non the Work Pressure → Participation Relationship', 
                 fontsize=15, fontweight='bold', pad=20)
    
    ax.legend(fontsize=11, loc='best', framealpha=0.9)
    ax.grid(True, alpha=0.3, linestyle='--')
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"\n交互效应图已保存: {save_path}")

def plot_johnson_neyman(results, save_path='johnson_neyman_plot.png'):
    """
    绘制Johnson-Neyman区间图
    
    Parameters
    ----------
    results : dict
        分析结果
    save_path : str
        保存路径
    """
    data = results['data']
    model3 = results['model3']
    W_mean = results['W_mean']
    
    b1 = model3.params['X_c']
    b3 = model3.params['XW']
    se_b1 = model3.bse['X_c']
    se_b3 = model3.bse['XW']
    cov_b1_b3 = model3.cov_params().loc['X_c', 'XW']
    
    t_crit = stats.t.ppf(0.975, model3.df_resid)
    
    w_range = np.linspace(data['W'].min(), data['W'].max(), 200)
    w_centered_range = w_range - W_mean
    
    slopes = b1 + b3 * w_centered_range
    ses = np.sqrt(se_b1**2 + w_centered_range**2 * se_b3**2 + 2 * w_centered_range * cov_b1_b3)
    
    ci_upper = slopes + t_crit * ses
    ci_lower = slopes - t_crit * ses
    
    fig, ax = plt.subplots(figsize=(10, 7))
    
    ax.plot(w_range, slopes, 'k-', linewidth=2.5, label='Simple Slope of X on Y')
    ax.fill_between(w_range, ci_lower, ci_upper, alpha=0.2, color='gray', label='95% CI')
    
    if len(results['jn_points']) >= 2:
        jn1 = min(results['jn_points'])
        jn2 = max(results['jn_points'])
        
        ax.axvspan(data['W'].min(), jn1, alpha=0.15, color='red', label='Significant Region (p < .05)')
        ax.axvspan(jn2, data['W'].max(), alpha=0.15, color='red')
        ax.axvspan(jn1, jn2, alpha=0.1, color='green', label='Non-significant Region')
        
        ax.axvline(x=jn1, color='red', linestyle='--', alpha=0.7)
        ax.axvline(x=jn2, color='red', linestyle='--', alpha=0.7)
    
    ax.axhline(y=0, color='black', linestyle='--', alpha=0.5)
    ax.axvline(x=W_mean, color='blue', linestyle=':', alpha=0.7, label=f'Mean W = {W_mean:.2f}')
    
    ax.set_xlabel('Workplace Policy Support (W)', fontsize=13, fontweight='bold')
    ax.set_ylabel('Simple Slope of Work Pressure\non Participation', fontsize=13, fontweight='bold')
    ax.set_title('Johnson-Neyman Regions of Significance', fontsize=15, fontweight='bold', pad=20)
    
    ax.legend(fontsize=9, loc='best', framealpha=0.9)
    ax.grid(True, alpha=0.3, linestyle='--')
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"Johnson-Neyman图已保存: {save_path}")

# ========== 5. 稳健性检验 ==========
def robustness_checks(results):
    """
    进行稳健性检验
    
    Parameters
    ----------
    results : dict
        分析结果
    
    Returns
    -------
    dict
        稳健性检验结果
    """
    data = results['data']
    model3 = results['model3']
    
    robustness = {}
    
    # 1. Bootstrap
    np.random.seed(42)
    n_boot = 5000
    boot_coefs = []
    
    for _ in range(n_boot):
        idx = np.random.choice(len(data), len(data), replace=True)
        boot_data = data.iloc[idx]
        
        try:
            X_boot = sm.add_constant(boot_data[['age', 'edu', 'income', 'children', 'X_c', 'W_c', 'XW']])
            boot_model = sm.OLS(boot_data['Y'], X_boot).fit()
            boot_coefs.append(boot_model.params['XW'])
        except:
            continue
    
    boot_coefs = np.array(boot_coefs)
    boot_ci = np.percentile(boot_coefs, [2.5, 97.5])
    boot_se = boot_coefs.std()
    
    robustness['bootstrap'] = {
        'ci_lower': boot_ci[0],
        'ci_upper': boot_ci[1],
        'se': boot_se,
        'n_boot': len(boot_coefs)
    }
    
    # 2. 二分法
    data['W_binary'] = (data['W'] > 0).astype(int)
    data['XW_binary'] = data['X_c'] * data['W_binary']
    
    X_bin = sm.add_constant(data[['age', 'edu', 'income', 'children', 'X_c', 'W_binary', 'XW_binary']])
    model_bin = sm.OLS(data['Y'], X_bin).fit()
    
    robustness['binary'] = {
        'B': model_bin.params['XW_binary'],
        'SE': model_bin.bse['XW_binary'],
        'p': model_bin.pvalues['XW_binary'],
        'delta_R2': model_bin.rsquared - results['model2'].rsquared
    }
    
    # 3. 无控制变量
    X_nocontrol = sm.add_constant(data[['X_c', 'W_c', 'XW']])
    model_nocontrol = sm.OLS(data['Y'], X_nocontrol).fit()
    
    robustness['no_control'] = {
        'B': model_nocontrol.params['XW'],
        'SE': model_nocontrol.bse['XW'],
        'p': model_nocontrol.pvalues['XW']
    }
    
    return robustness

def print_robustness(robustness):
    """
    打印稳健性检验结果
    
    Parameters
    ----------
    robustness : dict
        稳健性检验结果
    """
    print("\n【稳健性检验】")
    
    print("\n1. Bootstrap 5000次重抽样:")
    boot = robustness['bootstrap']
    print(f"   95% CI = [{boot['ci_lower']:.3f}, {boot['ci_upper']:.3f}]")
    print(f"   Bootstrap SE = {boot['se']:.3f}")
    print(f"   重抽样次数 = {boot['n_boot']}")
    
    print("\n2. 政策支持二分法:")
    binary = robustness['binary']
    print(f"   B = {binary['B']:.3f}, SE = {binary['SE']:.3f}, p = {binary['p']:.4f}")
    print(f"   ΔR² = {binary['delta_R2']:.3f}")
    
    print("\n3. 无控制变量:")
    nocontrol = robustness['no_control']
    print(f"   B = {nocontrol['B']:.3f}, SE = {nocontrol['SE']:.3f}, p = {nocontrol['p']:.4f}")
    
    print("\n" + "-"*60)

# ========== 主函数 ==========
def main():
    """主函数"""
    print("="*60)
    print("调节效应分析")
    print("Moderation Effect Analysis")
    print("="*60)
    
    # 数据路径（请根据实际情况修改）
    data_path = '../data_deidentified.xlsx'
    
    if not os.path.exists(data_path):
        print(f"\n错误: 找不到数据文件 {data_path}")
        print("请修改脚本中的数据路径")
        return
    
    # 1. 加载数据
    print("\n[1/5] 加载数据...")
    df_raw = load_and_preprocess_data(data_path)
    
    # 2. 提取变量
    print("\n[2/5] 提取变量...")
    data = extract_variables(df_raw)
    
    # 3. 调节效应分析
    print("\n[3/5] 进行调节效应分析...")
    results = moderation_analysis(data)
    
    # 4. 输出结果
    print_results(results)
    
    # 5. 稳健性检验
    print("\n[4/5] 进行稳健性检验...")
    robustness = robustness_checks(results)
    print_robustness(robustness)
    
    # 6. 可视化
    print("\n[5/5] 生成可视化图表...")
    plot_interaction(results, 'moderation_interaction_plot.png')
    plot_johnson_neyman(results, 'johnson_neyman_plot.png')
    
    # 保存结果
    with open('moderation_results.pkl', 'wb') as f:
        pickle.dump({'results': results, 'robustness': robustness}, f)
    print("\n分析结果已保存: moderation_results.pkl")
    
    # 保存清洗后的数据
    data.to_excel('moderation_analysis_data.xlsx', index=False)
    print("清洗后数据已保存: moderation_analysis_data.xlsx")
    
    print("\n" + "="*60)
    print("分析完成！")
    print("="*60)

if __name__ == '__main__':
    main()
