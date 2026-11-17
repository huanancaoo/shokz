import Image from "next/image"
import branding from "@/content/branding.json"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const categories = await listCategories()
  return (
    <footer className="shokz-footer">
      <div className="footer-top content-container">
        <div>
          <p className="eyebrow">STAY OPEN. STAY CONNECTED.</p>
          <h2>
            함께 듣는 세상,
            <br />
            함께하는 샥즈.
          </h2>
          <LocalizedClientLink href="/pages/membership" className="text-link">
            샥즈 멤버십 알아보기 <HugeiconsIcon icon={ArrowRight01Icon} />
          </LocalizedClientLink>
        </div>
        <div className="newsletter-preview">
          <h3>샥즈의 새로운 소식을 만나보세요</h3>
          <p>신제품과 브랜드 이야기, 특별한 순간을 가장 먼저.</p>
          <div className="newsletter-field">
            <input
              type="email"
              placeholder="이메일 주소"
              aria-label="뉴스레터 이메일 주소"
              disabled
            />
            <button disabled aria-label="뉴스레터 구독 전시 화면">
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </button>
          </div>
          <small>POC 전시 화면 · 구독 정보는 수집하지 않습니다.</small>
        </div>
      </div>
      <div className="footer-links content-container">
        <div className="footer-brand">
          <Image
            src={branding.logo}
            alt="SHOKZ"
            width={187}
            height={55}
            className="brand-logo-image"
          />
          <p>귀를 열고, 가능성을 열다.</p>
          <span>대한민국 · 한국어 · KRW</span>
        </div>
        <div>
          <h3>제품</h3>
          <LocalizedClientLink href="/store">전체 제품</LocalizedClientLink>
          {categories.map((category) => (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
            >
              {category.name}
            </LocalizedClientLink>
          ))}
          <LocalizedClientLink href="/compare">제품 비교</LocalizedClientLink>
        </div>
        <div>
          <h3>샥즈 알아보기</h3>
          <LocalizedClientLink href="/pages/technology">
            오픈이어 기술
          </LocalizedClientLink>
          <LocalizedClientLink href="/pages/ambassador">
            앰버서더
          </LocalizedClientLink>
          <LocalizedClientLink href="/pages/athletes">
            애슬리트
          </LocalizedClientLink>
          <LocalizedClientLink href="/journal">
            샥즈 소식 & 이벤트
          </LocalizedClientLink>
          <LocalizedClientLink href="/pages/membership">
            멤버십
          </LocalizedClientLink>
        </div>
        <div>
          <h3>고객지원</h3>
          {[
            ["고객지원", "support"],
            ["자주 묻는 질문", "faq"],
            ["정품 등록", "registration"],
            ["매장 찾기", "stores"],
            ["비즈니스 문의", "business"],
            ["보증 정책", "warranty"],
          ].map(([name, slug]) => (
            <LocalizedClientLink key={slug} href={`/pages/${slug}`}>
              {name}
            </LocalizedClientLink>
          ))}
        </div>
      </div>
      <div className="footer-bottom content-container">
        <span>© {new Date().getFullYear()} SHOKZ. POC EXPERIENCE.</span>
        <div>
          <LocalizedClientLink href="/pages/privacy">
            개인정보처리방침
          </LocalizedClientLink>
          <LocalizedClientLink href="/pages/terms">
            이용약관
          </LocalizedClientLink>
          <LocalizedClientLink href="/shipping">배송 안내</LocalizedClientLink>
          <LocalizedClientLink href="/returns">
            교환 및 반품
          </LocalizedClientLink>
        </div>
      </div>
    </footer>
  )
}
