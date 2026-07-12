import { describe, expect, it } from "vitest";
import { parseKindIpos } from "./kind";

// 실제 KIND 응답(2026-07)에서 딴 최소 픽스처: 확정가 有/無, 상장예정일 없는 행 포함.
const row = (name: string, price: string, listDate: string) => `
<tr style="cursor: pointer;" onclick="fnDetailView('20260101000001')">
  <td class="first" title="${name}"><img src='../images/common/icn_t_ko.gif' alt='코스닥' />${name}</td>
  <td class="txc">2026-06-11</td>
  <td class="txc">&nbsp;2026-06-09<br/> ~ 2026-06-15</td>
  <td class="txc">&nbsp;2026-06-18<br/> ~ 2026-06-19</td>
  <td class="txc">2026-06-23</td>
  <td class="txr">${price}</td>
  <td class="txr">84,000</td>
  <td class="txc">${listDate}</td>
  <td class="txl">KB증권(주)</td>
</tr>`;

const FIXTURE = `<table><thead><tr class="first" id="title-contents"></tr></thead><tbody>
${row("스트라드비젼", "12,000", "2026-06-30")}
${row("레메디", "&nbsp;", "2026-07-13")}
${row("미정회사", "&nbsp;", "&nbsp;")}
</tbody></table>`;

describe("parseKindIpos", () => {
  const out = parseKindIpos(FIXTURE);

  it("상장예정일 있는 행만 추출한다", () => {
    expect(out.map((i) => i.name)).toEqual(["스트라드비젼", "레메디"]);
    expect(out.every((i) => i.market === "KR")).toBe(true);
  });

  it("상장예정일과 확정공모가 여부(isEstimated)를 읽는다", () => {
    expect(out[0]).toMatchObject({ date: "2026-06-30", isEstimated: false });
    expect(out[1]).toMatchObject({ date: "2026-07-13", isEstimated: true });
  });

  it("상세 필드(청약기간·공모가·공모금액·주선인)를 채운다", () => {
    expect(out[0]).toMatchObject({
      subscription: "2026-06-18 ~ 2026-06-19",
      price: "12,000원",
      amount: "840억원", // 84,000백만원
      underwriter: "KB증권(주)",
    });
    // 확정가 없는 종목은 price 미포함
    expect(out[1].price).toBeUndefined();
  });

  it("마크업이 바뀌어 셀 수가 다르면 빈 배열(안전 실패)", () => {
    expect(parseKindIpos("<tr><td>뭔가</td></tr>")).toEqual([]);
  });
});
