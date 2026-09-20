import { useState } from 'react';
import { businessTypeOptions, regionOptions } from '../../data/mockData.js';
import { useAgent } from '../../app/AgentProvider.jsx';
import Icon from '../../components/ui/Icon.jsx';

export default function SearchPanel() {
  const { conditions, updateCondition, setConditions, interpretSearch, search, isSearchStale, searchNotice } = useAgent();
  const [expanded, setExpanded] = useState(true);
  const region2 = regionOptions[conditions.regionLevel1] || [];

  const changeRegion1 = (value) => {
    const nextChildren = regionOptions[value] || [];
    setConditions((prev) => ({ ...prev, regionLevel1: value, regionLevel2: nextChildren[0] || '' }));
  };

  const submitNatural = (event) => {
    event.preventDefault();
    interpretSearch();
  };

  return (
    <section className="search-panel panel">
      <div className="search-panel-top">
        <form className="natural-search" onSubmit={submitNatural}>
          <Icon name="spark" size={20} />
          <input value={conditions.naturalQuery} onChange={(e) => updateCondition('naturalQuery', e.target.value)} placeholder="예: 충청남도 천안시 최근 인허가 일식 음식점" aria-label="자연어 검색 조건" />
          <button type="submit" className="button subtle">조건 해석</button>
        </form>
        <button type="button" className="filter-toggle" onClick={() => setExpanded((prev) => !prev)} aria-expanded={expanded}><Icon name="filter" size={18} /> 검색 조건</button>
      </div>

      {expanded && <>
      <div className="filter-grid">
        <label><span>시·도</span><select value={conditions.regionLevel1} onChange={(e) => changeRegion1(e.target.value)}>{Object.keys(regionOptions).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>시·군·구</span><select value={conditions.regionLevel2} onChange={(e) => updateCondition('regionLevel2', e.target.value)}>{region2.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>인허가 시작일</span><input type="date" value={conditions.permitDateFrom} onChange={(e) => updateCondition('permitDateFrom', e.target.value)} /></label>
        <label><span>인허가 종료일</span><input type="date" value={conditions.permitDateTo} onChange={(e) => updateCondition('permitDateTo', e.target.value)} /></label>
        <label><span>업태</span><select value={conditions.businessType} onChange={(e) => updateCondition('businessType', e.target.value)}>{businessTypeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>사업장명</span><input value={conditions.storeNameKeyword} onChange={(e) => updateCondition('storeNameKeyword', e.target.value)} placeholder="선택 입력" /></label>
        <div className="search-submit-area"><button type="button" className="button primary" onClick={search}><Icon name="search" size={18} /> 음식점 조회</button></div>
      </div>
      <p className="source-freshness-note">LOCALDATA는 일 단위 갱신 기준으로 제공되며 기본 조회 종료일은 D-2로 설정합니다.</p>
      </>}

      {(isSearchStale || searchNotice) && <div className={isSearchStale ? 'search-notice stale' : 'search-notice'}>
        <span>{isSearchStale ? '검색 조건이 변경되었습니다. 아래 목록은 이전 조회 결과입니다.' : searchNotice}</span>
        {isSearchStale && <button type="button" onClick={search}>변경 조건으로 다시 조회</button>}
      </div>}
    </section>
  );
}
