import { useEffect, useRef, useState } from 'react'
import { GitHubIcon } from '../site/icons'
import { REPO_URL } from '../../lib/site'
import { fill, withLocale } from '../../lib/locales'
import type { Messages } from '../../lib/messages/en'

type Lang = {
  name: string
  file: string
  code: string[]
  bridge: string
  proof?: { what: string; total: number }
}

const LANGS: Lang[] = [
  {
    name: 'TypeScript',
    file: 'src/words.ts',
    code: ['export function wordCount(text: string): number {', '  return text.split(/\\s+/).filter(Boolean).length', '}'],
    bridge: 'napi-rs',
    proof: { what: 'Fuse.js', total: 3414 },
  },
  {
    name: 'JavaScript',
    file: 'lib/words.js',
    code: ['function wordCount(text) {', '  return text.split(/\\s+/).filter(Boolean).length', '}', '', 'module.exports = { wordCount }'],
    bridge: 'napi-rs',
    proof: { what: 'json-server', total: 514 },
  },
  {
    name: 'Python',
    file: 'words.py',
    code: ['def word_count(text: str) -> int:', '    return len(text.split())'],
    bridge: 'PyO3',
    proof: { what: 'CPython colorsys', total: 2400 },
  },
  {
    name: 'Go',
    file: 'words.go',
    code: ['func WordCount(text string) int {', '    return len(strings.Fields(text))', '}'],
    bridge: 'cgo',
    proof: { what: 'Go path', total: 2642 },
  },
  {
    name: 'Ruby',
    file: 'words.rb',
    code: ['def word_count(text)', '  text.split.size', 'end'],
    bridge: 'magnus',
    proof: { what: 'shellwords', total: 1617 },
  },
  {
    name: 'Java',
    file: 'Words.java',
    code: ['static int wordCount(String text) {', '  String t = text.strip();', '  return t.isEmpty() ? 0 : t.split("\\\\s+").length;', '}'],
    bridge: 'JNI',
    proof: { what: 'JDK facade', total: 4492 },
  },
  {
    name: 'C',
    file: 'words.c',
    code: [
      'int word_count(const char *s) {',
      '  int n = 0, in = 0;',
      '  for (; *s; s++)',
      '    if (isspace(*s)) in = 0;',
      '    else if (!in) { in = 1; n++; }',
      '  return n;',
      '}',
    ],
    bridge: 'extern "C"',
    proof: { what: 'glibc facade', total: 1859 },
  },
  {
    name: 'PHP',
    file: 'words.php',
    code: ['function word_count(string $t): int {', "  return count(preg_split('/\\s+/', trim($t), -1,", '    PREG_SPLIT_NO_EMPTY));', '}'],
    bridge: 'ext-ffi',
    proof: { what: 'PEAR XML_Util', total: 1838 },
  },
  {
    name: 'C#',
    file: 'Words.cs',
    code: ['static int WordCount(string t) =>', '  t.Split((char[]?)null,', '    StringSplitOptions.RemoveEmptyEntries).Length;'],
    bridge: 'P/Invoke',
    proof: { what: 'Google.Protobuf', total: 2941 },
  },
  {
    name: 'Kotlin',
    file: 'Words.kt',
    code: ['fun wordCount(text: String): Int =', '  text.split(Regex("\\s+")).count { it.isNotEmpty() }'],
    bridge: 'JNI',
  },
  {
    name: 'PowerShell',
    file: 'Words.psm1',
    code: ['function Get-WordCount([string]$Text) {', "  ($Text -split '\\s+' | Where-Object { $_ }).Count", '}'],
    bridge: 'P/Invoke',
  },
]

const RUST = ['pub fn word_count(text: &str) -> usize {', '    text.split_whitespace().count()', '}']

const TOKENS =
  /("[^"]*"|'[^']*')|\b(export|function|module|return|def|func|end|static|int|const|char|for|if|else|pub|fn|usize|number|string|str|String)\b/g

function Code({ line }: { line: string }) {
  const parts: React.ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of line.matchAll(TOKENS)) {
    const at = m.index ?? 0
    if (at > last) parts.push(line.slice(last, at))
    parts.push(
      <span key={k++} className={m[1] ? 'tk-str' : 'tk-kw'}>
        {m[0]}
      </span>,
    )
    last = at + m[0].length
  }
  if (last < line.length) parts.push(line.slice(last))
  return <>{parts}</>
}

function useCount(target: number, run: number, delay: number) {
  const [n, setN] = useState(target)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(target)
      return
    }
    setN(0)
    let raf = 0
    const start = performance.now() + delay
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - start) / 1300))
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, delay])
  return n
}

export default function Hero({ t, locale = 'en' }: { t: Messages['hero']; locale?: string }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(true)
  const [run, setRun] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const lang = LANGS[i]
  const count = useCount(lang.proof?.total ?? 0, run, 250)

  useEffect(() => {
    if (!auto || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => {
      setI((v) => (v + 1) % LANGS.length)
      setRun((r) => r + 1)
    }, 5200)
    return () => clearTimeout(t)
  }, [auto, i])

  const pick = (n: number) => {
    setAuto(false)
    setI(n)
    setRun((r) => r + 1)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = (i + (e.key === 'ArrowRight' ? 1 : LANGS.length - 1)) % LANGS.length
    pick(n)
    tabs.current[n]?.focus()
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title">
            {t.title1}
            <span className="line2">{t.title2}</span>
          </h1>
          <p className="sub">{t.sub}</p>
          <div className="actions">
            <a className="btn btn-primary" href={withLocale('/docs/introduction/quick-start', locale)}>
              {t.cta}
            </a>
            <a className="btn btn-quiet" href={REPO_URL}>
              <GitHubIcon />
              {t.source}
            </a>
          </div>
        </div>

        <div className="sheet">
          <div className="lang-tabs" role="tablist" aria-label={t.sourceLanguage} onKeyDown={onKey}>
            {LANGS.map((l, n) => (
              <button
                key={l.name}
                ref={(el) => {
                  tabs.current[n] = el
                }}
                role="tab"
                type="button"
                aria-selected={n === i}
                tabIndex={n === i ? 0 : -1}
                className={`lang-tab${n === i ? ' on' : ''}`}
                onClick={() => pick(n)}
              >
                {l.name}
                {n === i && auto && <span className="timer" key={run} aria-hidden />}
              </button>
            ))}
          </div>

          <div className="pane src" key={`s${run}`}>
            <div className="pane-head">
              <span className="role">original</span>
              {lang.file}
            </div>
            <pre>
              {lang.code.map((l, n) => (
                <span key={n} className="ln">
                  <Code line={l} />
                </span>
              ))}
            </pre>
          </div>

          <div className="bridge-row" aria-hidden>
            <span className="arrow">↓</span>
            {t.bridge}: {lang.bridge}
          </div>

          <div className="pane rs" key={`r${run}`}>
            <div className="pane-head">
              <span className="role">port</span>
              src/port.rs
            </div>
            <pre>
              {RUST.map((l, n) => (
                <span key={n} className="ln">
                  <Code line={l} />
                </span>
              ))}
            </pre>
          </div>

          <div className="verdict" aria-live="polite">
            {lang.proof ? (
              <>
                <span className="what">
                  {fill(t.verified, {
                    lang: lang.name,
                    what: lang.proof.what,
                    count: `${count.toLocaleString('en-US')} / ${lang.proof.total.toLocaleString('en-US')}`,
                  })}
                </span>
                <span className={`state${count === lang.proof.total ? ' ok' : ''}`}>{count === lang.proof.total ? 'match' : 'replaying'}</span>
              </>
            ) : (
              <span className="what">{fill(t.tested, { lang: lang.name })}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
