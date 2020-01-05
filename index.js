const ora = require('ora')
const fetch = require('node-fetch')
const { writeFile, readFileSync } = require('fs')
const { loadAsync } = require('jszip')

const ver = '1.3.61', ann = '13.0'

const plugin = `name: KotlinCore
main: cn.apisium.kotlin.Main
version: ${require('./package.json').version}
description: Kotlin library classes.
`

const urls = [
  `http://central.maven.org/maven2/org/jetbrains/kotlin/kotlin-stdlib-jdk8/${ver}/kotlin-stdlib-jdk8-${ver}.jar`,
  `http://central.maven.org/maven2/org/jetbrains/kotlin/kotlin-stdlib/${ver}/kotlin-stdlib-${ver}.jar`,
  `http://central.maven.org/maven2/org/jetbrains/kotlin/kotlin-stdlib-jdk7/${ver}/kotlin-stdlib-jdk7-${ver}.jar`,
  `http://central.maven.org/maven2/org/jetbrains/kotlin/kotlin-stdlib-common/${ver}/kotlin-stdlib-common-${ver}.jar`,
  `http://central.maven.org/maven2/org/jetbrains/kotlin/kotlin-reflect/${ver}/kotlin-reflect-${ver}.jar`,
  `http://central.maven.org/maven2/org/jetbrains/annotations/${ann}/annotations-${ann}.jar`,
  'http://central.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-core/1.1.1/kotlinx-coroutines-core-1.1.1.jar',
  'http://central.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-core-common/1.1.1/kotlinx-coroutines-core-common-1.1.1.jar',
  'https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-serialization-runtime/0.14.0/kotlinx-serialization-runtime-0.14.0.jar',
  'https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-serialization-runtime-common/0.14.0/kotlinx-serialization-runtime-common-0.14.0.jar',
  'http://nexus.okkero.com/repository/maven-releases/com/okkero/skedule/skedule/1.2.5/skedule-1.2.5.jar'
]

console.log(`Kotlin version: ${ver}, Annotations version: ${ann}`)
const o = ora({ text: 'Downloading files...', spinner: { frames: [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏"
], interval: 80 } }).start()

Promise.all(urls.map(uri => fetch(uri).then(b => b.buffer())))
  .then(d => o.succeed('Downloaded.') && d)
  .catch(e => o.fail('Download error.') && console.error(e))
  .then(d => o.start('Loading files...') && Promise.all(d.map(loadAsync)))
  .then(d => o.succeed('Loaded.') && d)
  .catch(e => o.fail('Loaded error.') && console.error(e))
  .then(d => {
    if (!d) return true
    o.start('Merging data...')
    const zip = d[0]
    d.slice(1).forEach(z => z.forEach((path, data) => zip.file(path, data.nodeStream())))
    zip.file('plugin.yml', plugin)
    zip.file('cn/apisium/kotlin/Main.class', readFileSync('./Main.class'))
    o.succeed('Merged.').start('Generating file...')
    return zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    }).then(buf => new Promise((a, b) => writeFile('./KotlinCore.jar', buf,
      e => e ? b(e) : a(o.succeed('Generated.')))))
  })
  .catch(e => o.fail('Generate fail.') && console.error(e))
