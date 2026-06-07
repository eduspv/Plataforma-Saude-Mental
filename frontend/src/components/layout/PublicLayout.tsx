import { Outlet } from "react-router-dom";
import NavbarPublic from "./NavbarPublic";

export default function PublicLayout() {
  return (
    <>
      <NavbarPublic />
      <Outlet />
    </>
  );
}