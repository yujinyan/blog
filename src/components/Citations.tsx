
export const TheAlgorithmDesignManual =
  ({ section, chapter }: { section?: [number, string], chapter?: [number, string] }) =>
    <>
      Skiena, Steven S..{` `}
      {section && `“§${section[0]} ${section[1]}.”`}
      {chapter && `“Chapter ${chapter[0]}. ${chapter[1]}.”`}
      {` `}<cite>The Algorithm Design Manual</cite>.
      Switzerland, Springer International Publishing, 2020.
    </>
