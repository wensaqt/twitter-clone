"use client";

import Image from "next/image";
import React, { useCallback } from "react";
import Button from "../ui/button";
import useRegisterModal from "@/hooks/useRegisterModal";
import RegisterModal from "../modals/register-modal";
import useLoginModal from "@/hooks/useLoginModal";
import LoginModal from "../modals/login-modal";

export default function Auth() {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const onOpenRegisterModal = useCallback(() => {
    registerModal.onOpen();
  }, [registerModal]);

  const onOpenLoginModal = useCallback(() => {
    loginModal.onOpen();
  }, [loginModal]);

  return (
    <>
      <RegisterModal />
      <LoginModal />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center h-screen">
        <Image
          src={"/images/y.svg"}
          alt="X"
          width={450}
          height={450}
          className="justify-self-center order-2 hidden md:block border-2 rounded-full border-white"
        />

        <div className="flex flex-col justify-center md:justify-between gap-6 order-1 h-full md:h-[50vh]">
          <div className="block md:hidden">
            <Image src={"/images/y.svg"} alt="X" width={50} height={50} />
          </div>
          <h1 className="text-6xl font-bold">C'est maintenant !</h1>
          <div className="w-full md:w-[60%]">
            <h2 className="font-bold text-3xl mb-4">Rejoignez aujourd'hui.</h2>
            <div className="flex flex-col space-y-2">
              <Button
                label={"Créer un compte"}
                fullWidth
                onClick={onOpenRegisterModal}
              />
              <div className="text-[10px] text-gray-400">
                En vous inscrivant, vous acceptez les{" "}
                <span className="text-orange-500">Termes d'utilisation</span> et
                <span className="text-orange-500">
                  {" "}
                  Politique de vie privée
                </span>
                , incluant l'utilisation de
                <span className="text-orange-500"> Cookies</span>.
              </div>
              <div className="flex items-center justify-center">
                <div className="h-px bg-gray-700 w-1/2" />
                <p className="mx-4">ou</p>
                <div className="h-px bg-gray-700 w-1/2" />
              </div>
              <div className="w-full md:w-[100%]">
                <h3 className="font-medium text-xl text-center mb-4">Déjà inscrit ?</h3>
                <Button
                  label={"Se connecter"}
                  fullWidth
                  outline
                  onClick={onOpenLoginModal}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
