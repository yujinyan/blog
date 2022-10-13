import React from "react"
import tw from "twin.macro"

const Button = tw.button`bg-transparent font-sans py-2 px-3 border rounded-full text-sm`
export const PrimaryButton = tw(Button)`hover:bg-sky-50 text-sky-500 border-sky-500 `


export default PrimaryButton
