// The installed @nestjs/core build supports an `instrument` create() option
// (see node_modules/@nestjs/core/nest-factory.js, options.instrument?.instanceDecorator)
// used by @nestjs/observe's ObserveInstrument, but the shipped @nestjs/common
// .d.ts does not declare it. Augment locally instead of patching node_modules.
import '@nestjs/common';

declare module '@nestjs/common' {
  interface NestApplicationOptions {
    instrument?: {
      instanceDecorator?: (instance: unknown) => unknown;
    };
  }
}
