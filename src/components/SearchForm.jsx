import { useMemo, useState } from "react";
import { validateSearchConditions } from "../utils/validation";

const BUILDING_TYPES = ["아파트", "다세대", "연립"];

export default function SearchForm({
  value,
  onChange,
  onInterpret,
  onSearch,
  structuredConditions,
  conditionsDirty,
  disabled,
}) {
  const [submitted, setSubmitted] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const errors = useMemo(() => validateSearchConditions(value), [value]);

  const update = (name, nextValue) => {
    onChange({
      ...value,
      [name]: nextValue,
    });
  };

  const toggleBuildingType = (type) => {
    const selected = value.buildingTypes.includes(type);

    update(
      "buildingTypes",
      selected
        ? value.buildingTypes.filter((item) => item !== type)
        : [...value.buildingTypes, type]
    );
  };

  const handleInterpret = async () => {
    setSubmitted(true);

    if (!value.naturalQuery?.trim()) {
      return;
    }

    await onInterpret();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) return;

    onSearch();
  };

  return (
    <form className="workspace-panel search-panel page-enter" onSubmit={handleSearch}>
      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-01 · 조건 접수 및 해석</span>
          <h1>어디를 먼저 방문할지 찾아볼까요?</h1>
          <p>
            자연어 요청을 구조화한 뒤 직원이 조건을 확인·수정하고 검색합니다.
          </p>
        </div>
        <div className="model-chip">
          <span className="model-chip-dot hyper" />
          HyperCLOVA X · Demo
        </div>
      </div>

      <div className="prompt-shell">
        <div className="prompt-icon" aria-hidden="true">AI</div>
        <textarea
          id="naturalQuery"
          value={value.naturalQuery}
          onChange={(event) => update("naturalQuery", event.target.value)}
          placeholder="예: 대전 서구에서 15년 이상, 200세대 이상 아파트를 찾아줘"
          rows={4}
        />
        <button
          className="prompt-submit"
          type="button"
          disabled={disabled || !value.naturalQuery?.trim()}
          onClick={handleInterpret}
        >
          <span>{structuredConditions ? "다시 해석" : "조건 해석"}</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>

      {structuredConditions && (
        <div
          className={
            conditionsDirty
              ? "interpreted-box edited page-enter"
              : "interpreted-box page-enter"
          }
        >
          <div className="interpreted-head">
            <span className={conditionsDirty ? "edited-check" : "success-check"}>
              {conditionsDirty ? "✎" : "✓"}
            </span>
            <div>
              <strong>
                {conditionsDirty
                  ? "AI 해석 후 직원이 상세 조건을 수정했습니다"
                  : "AI가 조건을 구조화했습니다"}
              </strong>
              <small>
                {conditionsDirty
                  ? "실제 검색에는 아래 상세 조건의 현재 값이 적용됩니다."
                  : "검색 전에 아래 조건을 검토하거나 수정할 수 있습니다."}
              </small>
            </div>
          </div>

          {!conditionsDirty && (
            <div className="condition-chips">
              <span>지역 · {structuredConditions.targetArea}</span>
              <span>최소 연식 · {structuredConditions.minBuildingAge}년</span>
              <span>최소 세대수 · {structuredConditions.minHouseholds}세대</span>
              <span>유형 · {structuredConditions.buildingTypes.join(" · ")}</span>
            </div>
          )}
        </div>
      )}

      <div className="detail-toggle-row">
        <button
          type="button"
          className="detail-toggle"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
        >
          상세 조건 {detailsOpen ? "접기" : "펼치기"}
          <span className={detailsOpen ? "chevron open" : "chevron"}>⌄</span>
        </button>
        <span>최종 검색은 상세 조건의 현재 값을 기준으로 실행됩니다.</span>
      </div>

      {detailsOpen && (
        <div className="form-grid detail-grid page-enter">
          <div className="field-block span-2">
            <label htmlFor="targetArea">영업 지역</label>
            <input
              id="targetArea"
              value={value.targetArea}
              onChange={(event) => update("targetArea", event.target.value)}
              placeholder="예: 대전광역시 서구 탄방동"
            />
            {submitted && errors.targetArea && (
              <span className="field-error">{errors.targetArea}</span>
            )}
          </div>

          <div className="field-block">
            <label htmlFor="minBuildingAge">최소 건물 연식</label>
            <div className="input-with-suffix">
              <input
                id="minBuildingAge"
                type="number"
                min="0"
                value={value.minBuildingAge}
                onChange={(event) => update("minBuildingAge", event.target.value)}
              />
              <span>년</span>
            </div>
            {submitted && errors.minBuildingAge && (
              <span className="field-error">{errors.minBuildingAge}</span>
            )}
          </div>

          <div className="field-block">
            <label htmlFor="maxBuildingAge">최대 건물 연식</label>
            <div className="input-with-suffix">
              <input
                id="maxBuildingAge"
                type="number"
                min="0"
                value={value.maxBuildingAge}
                onChange={(event) => update("maxBuildingAge", event.target.value)}
                placeholder="제한 없음"
              />
              <span>년</span>
            </div>
            {submitted && errors.maxBuildingAge && (
              <span className="field-error">{errors.maxBuildingAge}</span>
            )}
          </div>

          <div className="field-block">
            <label htmlFor="minHouseholds">최소 세대수</label>
            <div className="input-with-suffix">
              <input
                id="minHouseholds"
                type="number"
                min="0"
                value={value.minHouseholds}
                onChange={(event) => update("minHouseholds", event.target.value)}
              />
              <span>세대</span>
            </div>
            {submitted && errors.minHouseholds && (
              <span className="field-error">{errors.minHouseholds}</span>
            )}
          </div>

          <div className="field-block">
            <label>건물 유형</label>
            <div className="check-row">
              {BUILDING_TYPES.map((type) => (
                <label className="check-pill" key={type}>
                  <input
                    type="checkbox"
                    checked={value.buildingTypes.includes(type)}
                    onChange={() => toggleBuildingType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
            {submitted && errors.buildingTypes && (
              <span className="field-error">{errors.buildingTypes}</span>
            )}
          </div>
        </div>
      )}

      <div className="sticky-action-row split">
        <span className="search-ready-note">
          {structuredConditions
            ? conditionsDirty
              ? "직원이 수정한 상세 조건으로 검색합니다."
              : "해석된 조건을 확인했습니다. 건축물 데이터를 조회할 수 있습니다."
            : "먼저 자연어 조건을 해석해 주세요."}
        </span>

        <button
          className="primary-button"
          type="submit"
          disabled={disabled || !structuredConditions}
        >
          이 조건으로 검색
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
