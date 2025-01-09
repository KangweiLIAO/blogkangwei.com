import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    // Get the nonce from the request headers
    const nonce = ctx.req?.headers['x-nonce'] as string

    return {
      ...initialProps,
      nonce,
    }
  }

  render() {
    // Use optional chaining and provide a default empty string
    const nonce = ((this.props as any)?.nonce as string) ?? ''

    return (
      <Html>
        <Head nonce={nonce}>{/* Add any additional head elements here */}</Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
          {/* TensorFlow.js scripts with nonce */}
          <script nonce={nonce} src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core" defer />
          <script
            nonce={nonce}
            src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl"
            defer
          />
          <script
            nonce={nonce}
            src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection"
            defer
          />
        </body>
      </Html>
    )
  }
}

export default MyDocument
