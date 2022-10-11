export default function docConfig (location, word) {
  const prefix = 'https://docs.koderover.com/zadig'
  const docUrl = {
    'Personal Center': {
      KubeConfig: prefix + '/faq/product-usage/#kubectl-Tool Query-Installation Method',
      APIToken: prefix + '/api/usage/#api-Call Method'
    },
    'Account System': {
      custom: prefix + '/settings/account/custom/#Custom account system login flowchart'
    }
  }
  if (location !== '' && word !== '') {
    return docUrl[location][word]
  }
}
