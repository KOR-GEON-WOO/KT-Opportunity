import { useState } from "react";
import { daysSince, formatNumber } from "../utils/format";

const rawFields = [
  ["관리번호", "storeId"], ["사업장명", "storeName"], ["도로명주소", "roadAddress"], ["지번주소", "lotAddress"],
  ["인허가일자", "permitDate"], ["영업상태명", "businessStatus"], ["영업상태코드", "businessStatusCode"],
  ["상세영업상태명", "detailedBusinessStatus"], ["개방자치단체코드", "localGovernmentCode"], ["소재지면적", "area"],
  ["시설총규모", "facilitySize"], ["업태구분명", "businessType"], ["다중이용업소여부", "multiUseBusinessYn"],
  ["급수시설구분명", "waterSupplyType"], ["전화번호", "phone"], ["좌표정보(X)", "coordinateX"], ["좌표정보(Y)", "coordinateY"],
  ["데이터갱신시점", "dataUpdatedAt"], ["최종수정시점", "lastModifiedAt"],
];

export default function RestaurantResults({ restaurants, onSelect }) {
  const [rawStore, setRawStore] = useState(null);

  if (!restaurants.length) {
    return (
      <section className="empty-results">
        <div className="empty-icon">⌕</div>
        <h3>조회 결과가 아직 없습니다</h3>
        <p>검색 조건을 확인한 뒤 일반음식점 OpenAPI 조회를 실행하세요.</p>
      </section>
    );
  }

  return (
    <section className="results-panel">
      <div className="results-head">
        <div><span>SEARCH RESULT</span><h2>{restaurants.length}개의 신규 영업 후보</h2></div>
        <p>영업/정상 · 인허가일 최신순</p>
      </div>

      <div className="table-wrap desktop-only">
        <table className="restaurant-table">
          <thead><tr><th>신규도</th><th>사업장</th><th>업태</th><th>인허가일</th><th>규모</th><th>연락처</th><th>원천 데이터</th><th /></tr></thead>
          <tbody>
            {restaurants.map((store) => (
              <tr key={store.storeId}>
                <td><span className="fresh-badge">D+{daysSince(store.permitDate)}</span></td>
                <td><strong>{store.storeName}</strong><small>{store.roadAddress || store.lotAddress}</small></td>
                <td><span className="type-badge">{store.businessType || "기타"}</span></td>
                <td>{store.permitDate}</td>
                <td>{formatNumber(store.area, "㎡")}</td>
                <td>{store.phone || "미등록"}</td>
                <td><button className="text-button" type="button" onClick={() => setRawStore(store)}>19개 필드 보기</button></td>
                <td><button className="row-action" type="button" onClick={() => onSelect(store.storeId)}>영업 확인 →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-store-list mobile-only">
        {restaurants.map((store) => (
          <article key={store.storeId} className="mobile-store-card">
            <div><span className="fresh-badge">D+{daysSince(store.permitDate)}</span><span className="type-badge">{store.businessType || "기타"}</span></div>
            <h3>{store.storeName}</h3><p>{store.roadAddress || store.lotAddress}</p>
            <dl><div><dt>인허가</dt><dd>{store.permitDate}</dd></div><div><dt>면적</dt><dd>{formatNumber(store.area, "㎡")}</dd></div></dl>
            <div className="card-actions"><button className="text-button" onClick={() => setRawStore(store)}>원천 데이터</button><button className="row-action" onClick={() => onSelect(store.storeId)}>영업 확인 →</button></div>
          </article>
        ))}
      </div>

      {rawStore && (
        <div className="drawer-backdrop" onClick={() => setRawStore(null)}>
          <aside className="raw-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head"><div><span>LOCALDATA RAW FIELDS</span><h3>{rawStore.storeName}</h3></div><button onClick={() => setRawStore(null)}>×</button></div>
            <p className="drawer-sub">공공데이터 응답 중 영업 판단에 활용하는 핵심 필드를 정규화해 표시합니다.</p>
            <div className="raw-grid">
              {rawFields.map(([label, key]) => <div key={key}><span>{label}</span><strong>{rawStore[key] ?? "-"}</strong><code>{key}</code></div>)}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
