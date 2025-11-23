
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppContext } from './AppContext';

export interface AppSettings {
  // Display settings
  billingLayout: 'Touch Screen' | 'Keyboard';
  menuPreference: 'On the Left' | 'On the Right';
  defaultScreen: 'Dashboard' | 'Billing' | 'Table Management';
  orderLiveView: 'ASC' | 'DESC';
  kotLiveView: 'ASC' | 'DESC';
  kptBreachedOnTop: boolean;
  displayPrepTimeAlerts: boolean;
  displayItemImages: boolean;
  displaySearch: boolean;
  displaySettleAmount: boolean;
  showTip: boolean;
  tipSelection: 'None' | 'Percentage' | 'Fixed';
  tipValue: string;
  showCwt: boolean;
  
  // Default values
  defaultOrderType: 'Dine-In' | 'Takeaway' | 'Delivery';
  defaultCustomer: string;
  defaultPayment: 'Cash' | 'UPI' | 'Due';
  defaultQuantity: string;
  finalizeWithoutAmount: boolean;

  // Discount settings
  discountLabel: string;
  discountButtonText: string;
  displayNoDiscount: boolean;
  defaultOpenDiscount: boolean;
  enableOrderWiseInfo: boolean;
  allowNegativeQuantity: boolean;

  // Table Settlement
  lockActiveTable: 'save-print' | 'settle-save' | 'none';
  releaseTableOn: 'print-bill' | 'settle-save';
  releaseRecentSectionOn: 'print-bill' | 'settle-save';
  releaseForOnlineOrders: boolean;

  // Calculation settings
  roundOffOption: 'Normal' | 'Round off up' | 'Round off down' | 'None';
  roundOffIncrement: '1' | '0.5' | '0.25';
  decimalPoints: '0' | '1' | '2';
  displayServiceCharge: boolean;
  serviceChargeValue: number;
  taxOnServiceCharge: boolean;
  taxAmount: number;
  showContainerCharge: boolean;
  containerChargeLabel: string;
  containerChargeType: 'Item wise' | 'Order wise' | 'Fix per item';
  autoCalcDelivery: boolean;
  autoCalcPickUp: boolean;
  autoCalcDineIn: boolean;
  taxOnContainerCharge: boolean;
  specificAmountCondition: 'None' | 'Greater Than' | 'Less Than';
  specificAmount: string;
  showDeliveryCharge: boolean;
  defaultDeliveryCharge: string;
  taxOnDeliveryCharge: boolean;
  deliveryAmountCondition: 'None' | 'Greater Than' | 'Less Than';
  deliverySpecificAmount: string;
  calculateTaxBeforeDiscount: boolean;
  calculateBackwardTax: boolean;
  autoApplyItemDiscount: boolean;
  showItemDiscountBox: boolean;
  applyBogoAutomatically: boolean;
  ignoreAddonPrice: boolean;
  specialDiscountReasonMandatory: boolean;
  displayDiscountTextbox: boolean;
  assignBillToKotUser: boolean;
  saveKotOnSaveBill: boolean;
  considerNonPreparedKot: boolean;
  mergeDuplicateItems: boolean;
  splitBillWithGroups: boolean;
  autoFinalize: boolean;
  resetKotNumber: string;
  splitBillOption: 'Print Group wise' | 'Generate Separate Bills';
  disableTaxOnComplimentary: boolean;
  saveSpecialNote: boolean;
  displaySurcharge: boolean;
  surchargeValue: number;

  // Connected Services
  enableAutoConsumption: boolean;
  resetStockOnDayStart: boolean;
  outOfStockAction: 'Hide items' | 'Disable items';
  useRealTimeStock: boolean;
  enableManualDayEnd: boolean;
  preventDayEndOnActiveTable: boolean;
  preventDayEndOnUnsynced: boolean;
  restrictEditAfterDayEnd: boolean;
  sendLoyaltyDefault: boolean;
  loyaltyOnDelivery: boolean;
  loyaltyOnPickUp: boolean;
  loyaltyOnDineIn: boolean;
  sendLoyaltyDataOn: 'Print Bill' | 'Settle & Save' | 'None';
  sendKdsUpdateToOrderScreen: boolean;
  markKotAsDoneOnKds: boolean;
  printKotFromCaptainApp: boolean;
  allowDiscountFromCaptainApp: boolean;
  notifyCaptainUsersOn: 'Item Ready' | 'KOT Ready' | 'None';
  enableEInvoice: boolean;
  barcodePrefix: string;
  barcodeWeightChars: string;
  barcodeWeightDenominator: string;
  restrictExpenseToCurrentDate: boolean;
  invoicePrefix: string;
  invoiceNumberLength: string;
  invoiceSuffix: string;

  // Print Settings
  printCafeName: string;
  printAddress: string;
  printCustomDetails: string;
  printPhone: string;
  printFooterMessage: string;
  showOrderBarcode: boolean;
  printKotOnPrintBill: boolean;
  printOnlyModifiedKot: boolean;
  printOnlyModifiedItems: boolean;
  printCancelledKot: boolean;
  printAddonsBelow: boolean;
  showDuplicateInKot: boolean;
  printDeletedItems: boolean;
  printDeletedInSeparateKot: boolean;
  showBarcodeOnKot: boolean;
  printOnMove: boolean;
  printKotOnStatus: 'None' | 'Food Is Ready' | 'Dispatched';
  cwtBifurcation: 'None' | 'Print CWT';
  itemPricePrintOption: 'without' | 'including';
  showBackwardTax: boolean;
  showDuplicateOnReprint: boolean;
  showCustomerPaidAndReturn: boolean;
  printKotAsToken: boolean;
  showAddonsInBill: boolean;
  showOrderBarcodeOnBill: boolean;
  mergeEbillAndPrintBill: boolean;
  
  // Customer Settings
  phoneValidationDelivery: boolean;
  phoneValidationPickUp: boolean;
  phoneValidationDineIn: boolean;
  minLength: string;
  maxLength: string;
  showCustomerEmail: boolean;
  createBillsWithTaxId: boolean;
  isPhoneMandatoryForDue: boolean;

  // Billing System Settings
  closingHour: string;
  closingMinute: string;
  displayExtendNotification: boolean;
  is24x7: boolean;
  syncPacketSize: string;
  defaultOrderLimit: string;
autoSyncTime: string;
  pendingOrderSyncTime: string;
  captainOrderSyncTime: string;
  minutesToEdit: string;
  paymentRequestSyncTime: string;
  checkPaymentRequestSyncTime: string;
  billingScreenRefreshCount: string;
  managerPassword: string;
  idleTime: string;

  // POS State (not really settings, but managed here for convenience)
  discountValue: number;
  discountType: 'fixed' | 'percentage';
  isComplimentary: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  saveSettings: (pageName?: string) => Promise<void>;
  isSaving: boolean;
  loadSettingsForOutlet: (outletId: string) => void;
}

const defaultSettings: AppSettings = {
  billingLayout: 'Touch Screen',
  menuPreference: 'On the Left',
  defaultScreen: 'Dashboard',
  orderLiveView: 'DESC',
  kotLiveView: 'ASC',
  kptBreachedOnTop: true,
  displayPrepTimeAlerts: true,
  displayItemImages: false,
  displaySearch: true,
  displaySettleAmount: true,
  showTip: true,
  tipSelection: 'None',
  tipValue: '',
  showCwt: true,
  defaultOrderType: 'Dine-In',
  defaultCustomer: 'user-1',
  defaultPayment: 'Cash',
  defaultQuantity: '1',
  finalizeWithoutAmount: true,
  discountLabel: 'Coupon Code',
  discountButtonText: 'Apply',
  displayNoDiscount: true,
  defaultOpenDiscount: false,
  enableOrderWiseInfo: false,
  allowNegativeQuantity: false,
  lockActiveTable: 'settle-save',
  releaseTableOn: 'settle-save',
  releaseRecentSectionOn: 'settle-save',
  releaseForOnlineOrders: false,
  roundOffOption: 'Normal',
  roundOffIncrement: '1',
  decimalPoints: '2',
  displayServiceCharge: false,
  serviceChargeValue: 10,
  taxOnServiceCharge: false,
  taxAmount: 0,
  showContainerCharge: true,
  containerChargeLabel: 'Container Charge',
  containerChargeType: 'Item wise',
  autoCalcDelivery: true,
  autoCalcPickUp: true,
  autoCalcDineIn: false,
  taxOnContainerCharge: false,
  specificAmountCondition: 'None',
  specificAmount: '0',
  showDeliveryCharge: true,
  defaultDeliveryCharge: '0',
  taxOnDeliveryCharge: false,
  deliveryAmountCondition: 'None',
  deliverySpecificAmount: '0',
  calculateTaxBeforeDiscount: false,
  calculateBackwardTax: false,
  autoApplyItemDiscount: false,
  showItemDiscountBox: false,
  applyBogoAutomatically: false,
  ignoreAddonPrice: false,
  specialDiscountReasonMandatory: false,
  displayDiscountTextbox: true,
  assignBillToKotUser: false,
  saveKotOnSaveBill: true,
  considerNonPreparedKot: true,
  mergeDuplicateItems: true,
  splitBillWithGroups: false,
  autoFinalize: false,
  resetKotNumber: '1',
  splitBillOption: 'Generate Separate Bills',
  disableTaxOnComplimentary: true,
  saveSpecialNote: false,
  displaySurcharge: false,
  surchargeValue: 5,
  enableAutoConsumption: false,
  resetStockOnDayStart: false,
  outOfStockAction: 'Hide items',
  useRealTimeStock: false,
  enableManualDayEnd: false,
  preventDayEndOnActiveTable: false,
  preventDayEndOnUnsynced: false,
  restrictEditAfterDayEnd: false,
  sendLoyaltyDefault: true,
  loyaltyOnDelivery: true,
  loyaltyOnPickUp: true,
  loyaltyOnDineIn: true,
  sendLoyaltyDataOn: 'Settle & Save',
  sendKdsUpdateToOrderScreen: true,
  markKotAsDoneOnKds: true,
  printKotFromCaptainApp: true,
  allowDiscountFromCaptainApp: false,
  notifyCaptainUsersOn: 'None',
  enableEInvoice: false,
  barcodePrefix: '',
  barcodeWeightChars: '5',
  barcodeWeightDenominator: '1000',
  restrictExpenseToCurrentDate: false,
  invoicePrefix: '{yy}/ABC',
  invoiceNumberLength: '2',
  invoiceSuffix: '',
  printCafeName: '',
  printAddress: '',
  printCustomDetails: '',
  printPhone: '',
  printFooterMessage: '',
  showOrderBarcode: false,
  printKotOnPrintBill: true,
  printOnlyModifiedKot: true,
  printOnlyModifiedItems: false,
  printCancelledKot: false,
  printAddonsBelow: false,
  showDuplicateInKot: true,
  printDeletedItems: false,
  printDeletedInSeparateKot: false,
  showBarcodeOnKot: false,
  printOnMove: true,
  printKotOnStatus: 'None',
  cwtBifurcation: 'None',
  itemPricePrintOption: 'without',
  showBackwardTax: true,
  showDuplicateOnReprint: true,
  showCustomerPaidAndReturn: false,
  printKotAsToken: false,
  showAddonsInBill: true,
  showOrderBarcodeOnBill: false,
  mergeEbillAndPrintBill: false,
  
  // Customer Settings
  phoneValidationDelivery: true,
  phoneValidationPickUp: false,
  phoneValidationDineIn: false,
  minLength: '10',
  maxLength: '10',
  showCustomerEmail: false,
  createBillsWithTaxId: true,
  isPhoneMandatoryForDue: true,

  // Billing System Settings
  closingHour: '01',
  closingMinute: '00',
  displayExtendNotification: true,
  is24x7: false,
  syncPacketSize: '100',
  defaultOrderLimit: '500',
  autoSyncTime: '15',
  pendingOrderSyncTime: '5',
  captainOrderSyncTime: '5',
  minutesToEdit: '2880',
  paymentRequestSyncTime: '5',
  checkPaymentRequestSyncTime: '5',
  billingScreenRefreshCount: '0',
  managerPassword: '',
  idleTime: '0',

  // POS State (not really settings, but managed here for convenience)
  discountValue: 0,
  discountType: 'fixed',
  isComplimentary: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [currentOutletId, setCurrentOutletId] = useState<string | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();
  
  const settingsDocId = 'app_settings'; // Use a consistent ID

  const loadSettingsForOutlet = useCallback(async (outletId: string) => {
    if (!firestore || !outletId) return;
    setCurrentOutletId(outletId);
    
    const settingsRef = doc(firestore, `outlets/${outletId}/settings`, settingsDocId);
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      setSettings(prev => ({ ...defaultSettings, ...docSnap.data() }));
    } else {
      // If no settings exist for the outlet, create them with defaults
      await setDoc(settingsRef, defaultSettings);
      setSettings(defaultSettings);
    }
  }, [firestore]);
  

  const setSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveSettings = useCallback(async (pageName?: string) => {
    if (!firestore || !currentOutletId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot save settings. No outlet selected.",
        });
        return;
    }
    setIsSaving(true);
    const settingsRef = doc(firestore, `outlets/${currentOutletId}/settings`, settingsDocId);
    try {
        await setDoc(settingsRef, settings, { merge: true });
        toast({
            title: "Settings Saved",
            description: `${pageName || 'Your'} settings have been saved.`,
        });
    } catch (error) {
        console.error("Error saving settings:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save settings to the database.",
        });
    } finally {
        setIsSaving(false);
    }
  }, [settings, firestore, currentOutletId, toast]);

  return (
    <SettingsContext.Provider value={{ settings, setSetting, saveSettings, isSaving, loadSettingsForOutlet }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
