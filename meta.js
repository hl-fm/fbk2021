const title = "Fubuki's Journey 2021";
const description = "Fubuki's streams timeline of 2021";
const keywords = ['fubuki', '2021', 'journey'];
const siteUrl = process.env.SITE_URL || '';

const meta = {
  'title': title,
  'description': description,
  'keywords': keywords.join(','),
  'og:title': title,
  'og:description': description,
  'og:type': 'website',
  'og:url': siteUrl,
  'og:image': siteUrl + 'icons/ms-icon-310x310.png',
  'twitter:card': 'summary_large_image',
  'twitter:creator': '',
  'twitter:title': title,
  'twitter:description': description,
  'twitter:image': siteUrl + 'icons/ms-icon-310x310.png',
}

module.exports = { meta }