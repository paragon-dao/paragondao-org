import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'ParagonDAO'
const BASE_URL = 'https://paragondao.org'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

/**
 * SEO component — sets per-page title, description, and Open Graph tags.
 * Use on every public page to ensure unique meta tags for Google indexing.
 */
const SEO = ({ title, description, path = '/', image }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | The Health Economy`
  const url = `${BASE_URL}${path}`
  const ogImage = image || DEFAULT_IMAGE

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}

export default SEO
