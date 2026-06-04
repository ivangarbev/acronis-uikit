/**
 * Raw, unstyled HTML elements — shown as the library's CSS reset / defaults
 * render them (no component classes applied).
 */
export function ElementsSection() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 720,
      }}
    >
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>

      <p>
        A paragraph of body text with an{' '}
        <a href="https://www.acronis.com">inline link</a>,{' '}
        <strong>strong</strong>, <em>emphasis</em>, and <code>inline code</code>
        .
      </p>

      <blockquote>
        A blockquote — default rendering of quoted content.
      </blockquote>

      <ul>
        <li>Unordered list item one</li>
        <li>Unordered list item two</li>
      </ul>
      <ol>
        <li>Ordered list item one</li>
        <li>Ordered list item two</li>
      </ol>

      <pre>
        <code>{`const ok = true;\nconsole.log(ok);`}</code>
      </pre>

      <hr />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Backup</td>
            <td>OK</td>
          </tr>
          <tr>
            <td>Sync</td>
            <td>Running</td>
          </tr>
        </tbody>
      </table>

      <fieldset>
        <legend>Native form controls</legend>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <input type="text" placeholder="text input" />
          <input type="email" placeholder="email" />
          <input type="checkbox" defaultChecked /> <label>checkbox</label>
          <input type="radio" name="r" defaultChecked /> <label>radio</label>
          <select defaultValue="a">
            <option value="a">Option A</option>
            <option value="b">Option B</option>
          </select>
          <textarea placeholder="textarea" rows={2} />
          <button type="button">Native button</button>
        </div>
      </fieldset>
    </div>
  );
}
