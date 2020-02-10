const { execSync } = require('child_process')
const ghpages = require('gh-pages')
const dir = 'build'

execSync('npm run build', { stdio: 'inherit' })

ghpages.publish(dir, (err) => {
  if (err) console.error(err)
  else console.log('Published')
})
