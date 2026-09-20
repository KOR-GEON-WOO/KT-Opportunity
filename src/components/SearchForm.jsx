import { useMemo, useState } from "react";
import { validateSearchConditions } from "../utils/validation";

const BUILDING_TYPES = ["아파트", "다세대", "연립"];

export default function SearchForm({ value, onChange, onSubmit, disabled }) {
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(
    () => validateSearchConditions(value),
    [value]
  );

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

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit();
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <span className="section-kicker">F-01 · 조건 접수 및 해석</span>
          <h1>어디를 먼저 방문할지 찾아볼까요?</h1>
          <p>
            자연어 또는 상세 조건을 입력하면 영업 후보지 탐색 조건으로 구조화합니다.
          </p>
        </div>
        <div className="ai-chip">HyperCLOVA X · 조건 해석</div>
      </div>

      <div className="field-block">
        <label htmlFor="naturalQuery">AI 조건 입력</label>
        <textarea
          id="naturalQuery"
          value={value.naturalQuery}
          onChange={(event) => update("naturalQuery", event.target.value)}
          placeholder="예: 대전 서구에서 10년 이상, 100세대 이상 아파트 찾아줘"
          rows={4}
        />
        <small className="helper">
          현재 MVP에서는 상세 조건 값을 기준으로 Mock 검색을 실행합니다.
        </small>
      </div>

      <div className="form-grid">
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

      <div className="action-row">
        <span className="action-note">
          입력 누락값은 AI가 임의로 채우지 않습니다.
        </span>
        <button className="primary-button" type="submit" disabled={disabled}>
          후보지 검색
        </button>
      </div>
    </form>
  );
}
