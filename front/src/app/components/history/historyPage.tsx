"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/authContext";
import { User } from "@/app/types";
import { useEffect, useState } from "react";
import { UserCard } from "@/components/ui/carousel";
import { serverIP } from "@/app/constants";
import createRefreshClosure from "@/app/constants";

import "./historyPage.scss";

const CLASSNAME = "browse";

const historyPage: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profiles, setProfiles] = useState<User[]>([]);
  const { isJwtInCookie } = useAuth();

  const redirectLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    if (!isJwtInCookie()) {
      redirectLogin();
    }
    getProfiles();
    setIsLoggedIn(isJwtInCookie());
  }, []);

  const getProfiles = async () => {
    try {
      const refreshClosure = createRefreshClosure();
      const url = `http://${serverIP}:5000/api/getMyViews`;
      const infos = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await refreshClosure(url, infos);
      if (!response.ok) {
        throw new Error("Error fetching profiles");
      }
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const redirect = (id: number) => {
    router.push(`/profile/${id}`);
  };

  return (
    <>
      {isLoggedIn && (
        <>
          <div className={CLASSNAME}>
            <div className={`${CLASSNAME}__list`}>
              {profiles.map((profile, index) => {
                return (
                  <UserCard
                    key={index}
                    user={profile}
                    redirect={() => redirect(profile.id)}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default historyPage;
