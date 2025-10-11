import Image from "next/image";
import styles from "./page.module.css";
import Footer from "../../components/Footer";
// src/app/page.tsx
// Página principal actualizada con productos dinámicos desde Supabase

'use client';

import React from 'react';
import HomePage from '../components/HomePage';

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      
    </div>
  );
}

// Componente principal que renderiza la página de inicio
export default function Home() {
  return <HomePage />;
}
