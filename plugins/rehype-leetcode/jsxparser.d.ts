interface ReactElement {
  tag: string,
  props: { [key: string]: any }
}

export default function parse(input: string): ReactElement | undefined
