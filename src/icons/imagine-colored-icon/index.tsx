import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

const SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="a" x1="3.094" x2="36.885" y1="36.905" y2="3.123" gradientUnits="userSpaceOnUse"><stop stop-color="%23240E77"/><stop offset=".57" stop-color="%2334195B"/><stop offset="1" stop-color="%234E2B78"/></linearGradient><linearGradient id="b" x1="13.435" x2="26.407" y1="26.562" y2="13.603" gradientUnits="userSpaceOnUse"><stop stop-color="%23FBF9FF"/><stop offset=".05" stop-color="%23E6E0F8"/><stop offset=".14" stop-color="%23CABFEF"/><stop offset=".23" stop-color="%23B5A5E8"/><stop offset=".32" stop-color="%23A693E2"/><stop offset=".41" stop-color="%239C88DF"/><stop offset=".52" stop-color="%239A85DF"/><stop offset=".62" stop-color="%23A189E1"/><stop offset=".77" stop-color="%23B694EA"/><stop offset=".95" stop-color="%23D8A6F7"/><stop offset=".96" stop-color="%23DAA7F8"/></linearGradient><linearGradient id="c" x1="29.374" x2="40.41" y1="15.457" y2="11.963" gradientUnits="userSpaceOnUse"><stop stop-color="%23CC98F8"/><stop offset=".57" stop-color="%23F2C2FA"/><stop offset="1" stop-color="%23fff"/></linearGradient></defs><path fill="url(%23a)" d="M39.99 10.638C39.99 4.762 35.23 0 29.355 0H10.578C4.732 0 0 4.743 0 10.581v18.848C0 35.267 4.732 40 10.578 40h18.843C35.258 40 40 35.257 40 29.419v-18.78h-.01Z"/><path fill="url(%23b)" d="M19.995 32.105A19.146 19.146 0 0 1 32.097 20.01 19.16 19.16 0 0 1 19.995 7.904 19.145 19.145 0 0 1 7.894 20a19.16 19.16 0 0 1 12.101 12.105Z"/><path fill="url(%23c)" d="m39.99 10.362-2.913-.705-8.493-2.381c-1.152 7.667 3.599 7.98 7.798 8.962C38.39 16.704 40 17.543 40 20.523V10.362h-.01Z"/><path fill="%23fff" d="M3.619 23.762C1.609 23.295 0 22.467 0 19.476v10.172l2.913.704 8.493 2.381c1.152-7.666-3.599-7.98-7.798-8.962l.01-.01Z"/></svg>`;

const IMAGINE_ICON_SRC = `data:image/svg+xml,${SVG_CONTENT}`;

export const ImagineColoredIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    // eslint-disable-next-line next/no-img-element
    <img
      src={IMAGINE_ICON_SRC}
      alt=""
      className={className}
      draggable={false}
    />
  );
};
