// The `server-only` package ships JS only, so newer TS versions flag the
// side-effect import (TS2882). Declare it as an empty module.
declare module 'server-only'
