"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { type ThemeProviderProps } from "next-themes"
import {
  ColorModeProvider,
} from "./color-mode"
import customSystem from "@/lib/chakra-system"

export function Provider(props: ThemeProviderProps) {
  return (
    <ChakraProvider value={customSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
