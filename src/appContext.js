import { createContext, useContext } from 'react';

// Shared app context: data store, role switching, toast, AI modal, exports.
export const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppContext.Provider>');
  return ctx;
}

export const ROLE_NAMES = {
  public: 'หน้าหลักสาธารณะ (Landing & Public Dashboard)',
  municipality: 'เจ้าหน้าที่ฝ่ายปกครอง เทศบาลเมืองนนทบุรี',
  village: 'นิติบุคคลหมู่บ้าน แสนสุขนนท์ A',
  factory: 'ผู้แทนสถานประกอบการ โรงงาน C (นนทบุรี)',
  collector: 'พนักงานเก็บขยะประจำรถ (Collector Terminal)',
};
