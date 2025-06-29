import { useEffect, useState } from "react";

declare global {
  interface Window {
    Tawk_API?: {
      setAttributes: (
        attributes: { name?: string },
        callback: (error: unknown) => void
      ) => void;
    };
  }
}

const TawkToWidget = () => {
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const res = await fetch("/api/users/me", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not logged in");

        const data = await res.json();
        const { firstName, lastName } = data;
        const name = `${firstName} ${lastName}`;
        console.log("Fetched name for Tawk:", name);
        setFullName(name);
      } catch (err) {
        console.warn("User not logged in or fetch failed");
        console.error(err);
      }
    };

    getUserInfo();

    // Step 2: Load Tawk.to script
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/68615dd6056789190fade528/1iuu5d405";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    // Step 3: Set the name once Tawk is ready
    const interval = setInterval(() => {
      if (window.Tawk_API && fullName) {
        console.log("Setting Tawk.to name:", fullName);
        window.Tawk_API.setAttributes({ name: fullName }, (error: unknown) => {
          if (error) console.error("Tawk.to error:", error);
        });
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      document.body.removeChild(script);
    };
  }, [fullName]);

  return null;
};

export default TawkToWidget;
