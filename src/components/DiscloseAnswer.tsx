import React, { PropsWithChildren } from "react"
import { Disclosure, Transition } from "@headlessui/react"

export default function DiscloseAnswer({children} : PropsWithChildren<{}>) {
  return <Disclosure>
    <div className="w-full text-right my-4">
      <Disclosure.Button
        className="py-2 px-3 border border-sky-500 font-sans bg-transparent rounded-full hover:bg-sky-50 text-sm text-sky-500">
        查看解答
      </Disclosure.Button>
    </div>
    <Transition
      enter="transition duration-100 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
    >
      <Disclosure.Panel>
        {children}
      </Disclosure.Panel>
    </Transition>
  </Disclosure>
}

