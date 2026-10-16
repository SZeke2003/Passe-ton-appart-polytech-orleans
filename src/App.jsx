import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  MapPin,
  Home,
  Users,
  Calendar,
  Maximize2,
  Phone,
  MessageCircle,
  Plus,
  Search,
  Check,
  X,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Sparkles,
  Copy,
  CheckCircle2,
  Train,
  Wifi,
  Sofa,
  Car,
  WashingMachine,
  Bike,
  Upload,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Lock,
  Unlock,
  Edit3,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

// 1. Code Maître Admin BDE (permet de modifier ou supprimer n'importe quelle annonce)
const ADMIN_MASTER_CODE = 'POLYTECH2026';

// 2. IDENTIFIANTS FIREBASE DU PROJET "passe-ton-appart"
const MY_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyACxUpS21qysaf8q_a4SxMiLE6gN0Ig-K4',
  authDomain: 'passe-ton-appart.firebaseapp.com',
  projectId: 'passe-ton-appart',
  storageBucket: 'passe-ton-appart.firebasestorage.app',
  messagingSenderId: '1071830446672',
  appId: '1:1071830446672:web:401157fd7027fbdcae5755',
  measurementId: 'G-574C1G6YTC',
};

const appId =
  typeof __app_id !== 'undefined'
    ? __app_id
    : 'passe-ton-appart-polytech-orleans';

const getActiveFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      return JSON.parse(__firebase_config);
    } catch (e) {
      console.error('Erreur lecture configuration Firebase :', e);
    }
  }
  if (MY_FIREBASE_CONFIG.apiKey && MY_FIREBASE_CONFIG.projectId) {
    return MY_FIREBASE_CONFIG;
  }
  return null;
};

const activeFirebaseConfig = getActiveFirebaseConfig();
const firebaseApp = activeFirebaseConfig
  ? getApps().length === 0
    ? initializeApp(activeFirebaseConfig)
    : getApp()
  : null;
const auth = firebaseApp ? getAuth(firebaseApp) : null;
const db = firebaseApp ? getFirestore(firebaseApp) : null;

const INITIAL_LISTINGS = [
  {
    id: 'welcome-bde',
    title: '👋 Bienvenue sur Passe ton Appart ! (Poste ton annonce)',
    type: 'Studio / T1',
    sector: 'Campus/La Source',
    address: 'Polytech Orléans, 45100 Orléans',
    rent: 0,
    charges: 0,
    surface: 0,
    availableFrom: '2026-06-01',
    furnished: true,
    roommatesCount: 1,
    dpe: 'A',
    secretCode: 'POLYTECH2026',
    amenities: ['Meublé', 'Proche Tram A'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ],
    studentName: 'BDE Polytech Orléans',
    studentPromo: 'Bureau des Élèves',
    studentPhone: '06 00 00 00 00',
    studentAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    honestReview:
      "C'est ici que s'afficheront les apparts transmis par les élèves de l'école. Clique sur 'Passer mon appart' en haut pour publier le tien !",
    distanceInfo: 'Au cœur de l’école',
    repriseInfo: 'Plateforme officielle BDE',
    createdAt: "À l'instant",
  },
];

const SECTORS = [
  'Tous',
  'Campus/La Source',
  'Centre Ville',
  'Gare',
  'Saint-Marceau',
  'Olivet',
  'Autre',
];

const PROPERTY_TYPES = [
  'Tous',
  'Studio / T1',
  'Colocation',
  'T2 / Deux pièces',
];

const AMENITY_OPTIONS = [
  { label: 'Meublé', icon: Sofa },
  { label: 'Proche Tram A', icon: Train },
  { label: 'Fibre optique', icon: Wifi },
  { label: 'Machine à laver', icon: WashingMachine },
  { label: 'Parking gratuit', icon: Car },
  { label: 'Local vélo', icon: Bike },
];

const QUICK_SAMPLE_PHOTOS = [
  {
    label: 'Salon lumineux',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Coin chambre',
    url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4573?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Cuisine équipée',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  },
];

const compressImageFile = (file, maxWidth = 800, quality = 0.65) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const OrangeAsterisk = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <rect x="42" y="6" width="16" height="88" rx="8" />
    <rect x="6" y="42" width="88" height="16" rx="8" />
    <rect
      x="42"
      y="6"
      width="16"
      height="88"
      rx="8"
      transform="rotate(45 50 50)"
    />
    <rect
      x="42"
      y="6"
      width="16"
      height="88"
      rx="8"
      transform="rotate(-45 50 50)"
    />
  </svg>
);

const HandDrawnOval = ({ className = '' }) => (
  <svg
    viewBox="0 0 260 90"
    fill="none"
    className={`pointer-events-none ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M22 48 C15 18, 95 6, 165 12 C230 17, 255 38, 242 60 C228 82, 130 86, 58 76 C12 69, 8 40, 42 26"
      stroke="#EA580C"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

const HandDrawnStar = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    <path
      d="M24 4 L28 18 L43 19 L31 28 L35 43 L24 34 L13 43 L17 28 L5 19 L20 18 Z"
      stroke="#EA580C"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EMPTY_FORM_STATE = {
  title: '',
  type: 'Studio / T1',
  sector: 'Campus/La Source',
  address: '',
  rent: '',
  charges: '',
  surface: '',
  availableFrom: '2026-06-01',
  roommatesCount: '1',
  dpe: 'C',
  amenities: ['Meublé', 'Proche Tram A'],
  images: [],
  studentName: '',
  studentPromo: '',
  studentPhone: '',
  distanceInfo: '',
  repriseInfo: '',
  honestReview: '',
  secretCode: '',
};

export default function PasseTonAppart() {
  const [listings, setListings] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const hasSeededRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');
  const [maxBudget, setMaxBudget] = useState(750);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);

  const [selectedListing, setSelectedListing] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null);

  const [showManagePanel, setShowManagePanel] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockedAsAdmin, setUnlockedAsAdmin] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);
  const [showSecretInForm, setShowSecretInForm] = useState(false);

  const [cardImageIndexes, setCardImageIndexes] = useState({});

  const [copiedPhoneId, setCopiedPhoneId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSenderName, setContactSenderName] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(EMPTY_FORM_STATE);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Authentification Firebase transparente (sans création de compte pour l'élève)
  useEffect(() => {
    if (!auth) {
      setIsLoadingDb(false);
      return;
    }

    const authenticateUser = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.warn('Accès direct Firestore en mode test :', error);
        setUser({ uid: 'eleve-polytech-orleans' });
        setIsLoadingDb(false);
      }
    };

    authenticateUser();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });

    return () => unsubscribeAuth();
  }, []);

// 2. Synchronisation en temps réel avec la collection Firestore
useEffect(() => {
  if (!user || !db) return;

  const listingsCollection = collection(
    db,
    'artifacts',
    appId,
    'public',
    'data',
    'listings'
  );

  const unsubscribeSnapshot = onSnapshot(
    listingsCollection,
    async (snapshot) => {
      let liveListings = snapshot.docs.map((docSnap) => ({
        ...docSnap.data(),
        id: docSnap.id,
      }));

      // Si la base contient d'autres annonces en plus de l'annonce de bienvenue, on supprime l'annonce de bienvenue
      if (liveListings.length > 1 && liveListings.some(item => item.id === 'welcome-bde')) {
        try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'listings', 'welcome-bde'));
          liveListings = liveListings.filter(item => item.id !== 'welcome-bde');
        } catch (err) {
          console.error('Erreur suppression auto welcome :', err);
        }
      }

      // Si la base est totalement vide, on injecte l'annonce de bienvenue par défaut
      if (liveListings.length === 0) {
        const welcomeItem = INITIAL_LISTINGS[0];
        try {
          await setDoc(
            doc(db, 'artifacts', appId, 'public', 'data', 'listings', welcomeItem.id),
            {
              ...welcomeItem,
              createdAtTimestamp: Date.now(),
            }
          );
          liveListings = [welcomeItem];
        } catch (err) {
          console.error('Erreur création auto welcome :', err);
        }
      }

      liveListings.sort(
        (a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0)
      );

      setListings(liveListings);
      setIsLoadingDb(false);
    },
    (error) => {
      console.error('Erreur synchronisation Firestore :', error);
      setIsLoadingDb(false);
    }
  );

  return () => unsubscribeSnapshot();
}, [user]);

  const safeHeroIndex = listings.length > 0 ? heroIndex % listings.length : 0;
  const heroListing = listings[safeHeroIndex] || INITIAL_LISTINGS[0];

  const openListingModal = (listing) => {
    setSelectedListing(listing);
    setModalImageIndex(0);
    setShowManagePanel(false);
    setEnteredCode('');
    setIsUnlocked(false);
    setUnlockedAsAdmin(false);
    setCodeError('');
    setConfirmDeleteStep(false);
  };

  useEffect(() => {
    if (!selectedListing) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
        return;
      const imgs = selectedListing.images || [];
      if (imgs.length <= 1) return;
      if (e.key === 'ArrowRight') {
        setModalImageIndex((prev) => (prev + 1) % imgs.length);
      } else if (e.key === 'ArrowLeft') {
        setModalImageIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedListing]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // On exclut l'annonce de bienvenue des résultats de recherche/filtres
      if (item.id === 'welcome-bde') return false;

      const totalRent = Number(item.rent) + Number(item.charges);
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.honestReview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentPromo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector =
        selectedSector === 'Tous' || item.sector === selectedSector;
      const matchesType = selectedType === 'Tous' || item.type === selectedType;
      const matchesBudget = totalRent <= maxBudget;

      return matchesSearch && matchesSector && matchesType && matchesBudget;
    });
  }, [listings, searchQuery, selectedSector, selectedType, maxBudget]);

  const openCreateModal = () => {
    setEditingListingId(null);
    setFormData(EMPTY_FORM_STATE);
    setShowSecretInForm(false);
    setIsPublishModalOpen(true);
  };

  const openEditModalFromListing = (listing) => {
    setEditingListingId(listing.id);
    setFormData({
      title: listing.title || '',
      type: listing.type || 'Studio / T1',
      sector: listing.sector || 'Campus/La Source',
      address: listing.address || '',
      rent: String(listing.rent || ''),
      charges: String(listing.charges || ''),
      surface: String(listing.surface || ''),
      availableFrom: listing.availableFrom || '2026-06-01',
      roommatesCount: String(listing.roommatesCount || '1'),
      dpe: listing.dpe || 'C',
      amenities: listing.amenities || ['Meublé'],
      images: listing.images || [],
      studentName: listing.studentName || '',
      studentPromo: listing.studentPromo || '',
      studentPhone: listing.studentPhone || '',
      distanceInfo: listing.distanceInfo || '',
      repriseInfo: listing.repriseInfo || '',
      honestReview: listing.honestReview || '',
      secretCode: listing.secretCode || '1234',
    });
    setSelectedListing(null);
    setIsPublishModalOpen(true);
  };

  const handleVerifySecretCode = (e) => {
    e.preventDefault();
    if (!selectedListing) return;
    const cleanInput = enteredCode.trim();
    const listingSecret = (selectedListing.secretCode || '1234').trim();

    if (cleanInput.toUpperCase() === ADMIN_MASTER_CODE.toUpperCase()) {
      setIsUnlocked(true);
      setUnlockedAsAdmin(true);
      setCodeError('');
      showToast('Accès déverrouillé en mode Administrateur BDE');
    } else if (cleanInput === listingSecret) {
      setIsUnlocked(true);
      setUnlockedAsAdmin(false);
      setCodeError('');
      showToast(
        'Code secret validé ! Tu peux modifier ou supprimer ton annonce.'
      );
    } else {
      setCodeError(
        'Code incorrect. Entre le code choisi lors du dépôt (ou le code Admin).'
      );
    }
  };

  const handleDeleteListing = async (listingId) => {
    const updated = listings.filter((item) => item.id !== listingId);
    setListings(updated);
    setSelectedListing(null);
    setHeroIndex(0);

    if (user && db) {
      try {
        await deleteDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'listings', listingId)
        );
      } catch (error) {
        console.error('Erreur lors de la suppression Firestore :', error);
      }
    }

    showToast('Annonce supprimée de la base de données !');
  };

  const handleCardPrevImage = (e, listing) => {
    e.stopPropagation();
    const total = listing.images.length;
    setCardImageIndexes((prev) => ({
      ...prev,
      [listing.id]: ((prev[listing.id] || 0) - 1 + total) % total,
    }));
  };

  const handleCardNextImage = (e, listing) => {
    e.stopPropagation();
    const total = listing.images.length;
    setCardImageIndexes((prev) => ({
      ...prev,
      [listing.id]: ((prev[listing.id] || 0) + 1) % total,
    }));
  };

  const copyPhone = (phone, id) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    showToast('Numéro copié dans le presse-papier !');
    setTimeout(() => setCopiedPhoneId(null), 2500);
  };

  const toggleAmenityInForm = (amenityLabel) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityLabel)
        ? prev.amenities.filter((a) => a !== amenityLabel)
        : [...prev.amenities, amenityLabel],
    }));
  };

  const handleFilesSelected = async (fileList) => {
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length === 0) {
      showToast('Sélectionne uniquement des fichiers image.');
      return;
    }

    setIsCompressingPhotos(true);
    try {
      const compressedImages = await Promise.all(
        files.map((file) => compressImageFile(file, 800, 0.65))
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...compressedImages],
      }));
      showToast(
        `${compressedImages.length} photo(s) optimisée(s) et ajoutée(s) !`
      );
    } catch (err) {
      console.error('Erreur compression image :', err);
      showToast("Erreur lors de l'importation de l'image.");
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const removeUploadedImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const setAsMainImage = (indexToPromote) => {
    if (indexToPromote === 0) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      const [picked] = updated.splice(indexToPromote, 1);
      updated.unshift(picked);
      return { ...prev, images: updated };
    });
    showToast('Photo principale mise à jour !');
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.rent ||
      !formData.studentName ||
      !formData.studentPhone
    ) {
      showToast('Merci de remplir les champs principaux.');
      return;
    }

    if (!formData.secretCode || formData.secretCode.trim().length < 3) {
      showToast(
        'Choisis un code secret (au moins 3 caractères) pour pouvoir gérer ton annonce.'
      );
      return;
    }

    const finalImages =
      formData.images.length > 0
        ? formData.images
        : [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          ];

    if (editingListingId) {
      const existingItem = listings.find(
        (item) => item.id === editingListingId
      );
      const updatedItem = {
        ...(existingItem || {}),
        id: editingListingId,
        title: formData.title,
        type: formData.type,
        sector: formData.sector,
        address: formData.address || `${formData.sector}, Orléans`,
        rent: Number(formData.rent),
        charges: Number(formData.charges || 0),
        surface: Number(formData.surface || 25),
        availableFrom: formData.availableFrom,
        furnished: formData.amenities.includes('Meublé'),
        roommatesCount:
          formData.type === 'Colocation'
            ? Number(formData.roommatesCount || 2)
            : 1,
        dpe: formData.dpe,
        amenities: formData.amenities,
        images: finalImages,
        studentName: formData.studentName,
        studentPromo: formData.studentPromo || 'Élève Polytech Orléans',
        studentPhone: formData.studentPhone,
        honestReview:
          formData.honestReview ||
          'Appartement très agréable, contacte-moi sur WhatsApp pour visiter !',
        distanceInfo: formData.distanceInfo || `Secteur ${formData.sector}`,
        repriseInfo: formData.repriseInfo || 'Contact direct avec l’élève',
        secretCode: formData.secretCode.trim(),
      };

      setListings((prev) =>
        prev.map((item) => (item.id === editingListingId ? updatedItem : item))
      );

      if (user && db) {
        try {
          await setDoc(
            doc(
              db,
              'artifacts',
              appId,
              'public',
              'data',
              'listings',
              editingListingId
            ),
            updatedItem
          );
        } catch (error) {
          console.error('Erreur mise à jour Firestore :', error);
        }
      }

      setIsPublishModalOpen(false);
      setEditingListingId(null);
      showToast('Annonce mise à jour avec succès !');
    } else {
      const newId = `apt-${Date.now()}`;
      const createdListing = {
        id: newId,
        title: formData.title,
        type: formData.type,
        sector: formData.sector,
        address: formData.address || `${formData.sector}, Orléans`,
        rent: Number(formData.rent),
        charges: Number(formData.charges || 0),
        surface: Number(formData.surface || 25),
        availableFrom: formData.availableFrom,
        furnished: formData.amenities.includes('Meublé'),
        roommatesCount:
          formData.type === 'Colocation'
            ? Number(formData.roommatesCount || 2)
            : 1,
        dpe: formData.dpe,
        amenities: formData.amenities,
        images: finalImages,
        studentName: formData.studentName,
        studentPromo: formData.studentPromo || 'Élève Polytech Orléans',
        studentPhone: formData.studentPhone,
        studentAvatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        honestReview:
          formData.honestReview ||
          'Appartement très agréable, contacte-moi sur WhatsApp pour plus de détails ou pour visiter !',
        distanceInfo: formData.distanceInfo || `Secteur ${formData.sector}`,
        repriseInfo:
          formData.repriseInfo ||
          'Contact direct avec l’élève qui quitte le logement',
        secretCode: formData.secretCode.trim(),
        createdAt: "À l'instant",
        createdAtTimestamp: Date.now(),
      };

      setListings((prev) => [createdListing, ...prev]);

      if (user && db) {
        try {
          await setDoc(
            doc(db, 'artifacts', appId, 'public', 'data', 'listings', newId),
            createdListing
          );
        } catch (error) {
          console.error('Erreur création Firestore :', error);
        }
      }

      setIsPublishModalOpen(false);
      setHeroIndex(0);
      showToast(
        "Ton appart est en ligne ! Garde bien ton code secret pour le modifier ou l'enlever."
      );
    }
  };

  const handleSendQuickContact = (e, listing) => {
    e.preventDefault();
    if (!contactSenderName.trim()) {
      showToast('Indique ton prénom pour préparer le message !');
      return;
    }
    const cleanPhone = listing.studentPhone
      .replace(/\s+/g, '')
      .replace(/^0/, '33');
    const text = encodeURIComponent(
      `Salut ${
        listing.studentName
      } ! Je suis ${contactSenderName} (Polytech Orléans), j'ai vu ton annonce "${
        listing.title
      }" sur Passe ton Appart. ${
        contactMessage || "Est-ce qu'il est toujours dispo pour une visite ?"
      }`
    );
    window.open(
      `https://wa.me/${cleanPhone}?text=${text}`,
      '_blank',
      'noopener,noreferrer'
    );
    showToast('Ouverture de WhatsApp avec ton message pré-rempli !');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const heroMiniCards = useMemo(() => {
    if (listings.length === 0) return [];
    const items = [];
    for (let i = 0; i < Math.min(3, listings.length); i++) {
      const idx = (safeHeroIndex + i) % listings.length;
      items.push({ listing: listings[idx], index: idx });
    }
    return items;
  }, [listings, safeHeroIndex]);

  return (
    <div
      className="min-h-screen w-full max-w-full bg-[#FAF8F5] text-zinc-900 selection:bg-orange-500 selection:text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-serif-editorial { font-family: 'Instrument Serif', serif; }
        .font-hand { font-family: 'Caveat', cursive; }
      `}</style>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-orange-500/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="bg-zinc-950 text-stone-300 text-[11px] tracking-[0.18em] uppercase py-2.5 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-semibold text-orange-400">
            <OrangeAsterisk className="w-3.5 h-3.5 text-orange-500" />
            ENTRAIDE LOGEMENT POLYTECH ORLÉANS
          </span>
          <span className="hidden md:flex items-center gap-3 text-stone-400">
            <span>DE PROMO EN PROMO</span>
            <span className="text-orange-500">▸</span>
            <span> BÂTIMENTS VINCI & GALILÉE</span>
            <span className="text-orange-500">▸</span>
            <span>GESTION PAR CODE SECRET</span>
          </span>
          <span className="flex items-center gap-2 text-stone-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>{listings.length} apparts en ligne</span>
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
          <nav className="hidden lg:flex items-center bg-white border border-stone-200/90 rounded-full p-1.5 shadow-sm">
            <button
              onClick={() => scrollToSection('hero-section')}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-zinc-900 text-white transition"
            >
              À la une
            </button>
            <button
              onClick={() => scrollToSection('recherche-section')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-orange-600 transition"
            >
              Rechercher un appart
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-orange-600 transition"
            >
              Comment ça marche ?
            </button>
          </nav>

          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="flex items-center tracking-tighter font-display text-xl sm:text-2xl font-extrabold text-zinc-900">
              <span>P</span>
              <OrangeAsterisk className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-0.5 group-hover:rotate-90 transition-transform duration-500" />
              <span>SSE</span>
              <span className="font-serif-editorial italic font-normal text-orange-600 text-2xl sm:text-3xl mx-1.5">
                ton
              </span>
              <span>APPART</span>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-widest bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full">
              Polytech Orléans
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openCreateModal}
              className="group flex items-center gap-2 bg-white hover:bg-orange-600 text-zinc-900 hover:text-white border border-stone-300 hover:border-orange-600 pl-2 pr-4 py-1.5 rounded-full shadow-sm transition-all duration-300"
            >
              <span className="w-8 h-8 rounded-full bg-orange-600 group-hover:bg-white text-white group-hover:text-orange-600 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4" />
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                Passer mon appart
              </span>
              <ArrowUpRight className="w-4 h-4 text-orange-600 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        <div className="flex lg:hidden items-center justify-center gap-2 px-4 pb-3 overflow-x-auto">
          <button
            onClick={() => scrollToSection('hero-section')}
            className="px-3.5 py-1 rounded-full text-xs font-bold bg-zinc-900 text-white shrink-0"
          >
            À la une
          </button>
          <button
            onClick={() => scrollToSection('recherche-section')}
            className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white border border-stone-200 text-zinc-700 shrink-0"
          >
            Rechercher un appart
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white border border-stone-200 text-zinc-700 shrink-0"
          >
            Comment ça marche ?
          </button>
        </div>
      </header>

      <section
        id="hero-section"
        className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-6 pb-8"
      >
        <div className="bg-white rounded-[2.2rem] p-5 sm:p-8 lg:p-10 shadow-xl shadow-stone-200/70 border border-stone-200/90 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold mb-5">
                  <HandDrawnStar className="w-4 h-4" />
                  <span>Entre élèves • Sans intermédiaire</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.08]">
                  Trouve ton{' '}
                  <span className="inline-flex items-center -space-x-2 align-middle mx-1 bg-orange-100/90 p-1 rounded-full border border-orange-300">
                    <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-orange-600 text-white text-[10px] sm:text-xs font-extrabold flex items-center justify-center ring-2 ring-white">
                      5A
                    </span>
                    <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-zinc-900 text-white text-[10px] sm:text-xs font-extrabold flex items-center justify-center ring-2 ring-white">
                      4A
                    </span>
                    <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-500 text-zinc-950 text-[10px] sm:text-xs font-extrabold flex items-center justify-center ring-2 ring-white">
                      3A
                    </span>
                  </span>{' '}
                  prochain appart transmis par{' '}
                  <span className="relative inline-block px-2">
                    <span className="font-serif-editorial italic font-normal text-4xl sm:text-6xl text-orange-600">
                      un élève
                    </span>
                    <HandDrawnOval className="absolute -inset-x-2 -inset-y-2 w-[calc(100%+16px)] h-[calc(100%+14px)]" />
                  </span>
                </h1>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 border-t border-dashed border-stone-300" />
                  <div className="px-4 py-1.5 rounded-full border border-dashed border-orange-400 bg-orange-50/50 text-[11px] font-bold text-orange-700 tracking-wider uppercase">
                    Comment ?
                  </div>
                  <div className="flex-1 border-t border-dashed border-stone-300" />
                </div>

                <div className="flex items-start gap-3 mb-6">
                  <span className="w-3 h-3 rounded-sm bg-orange-500 mt-1 shrink-0" />
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                    Un 5A part en stage de fin d'études ? Un 4A part en semestre
                    à l'étranger ? Reprends directement son appart ou sa place
                    en coloc avec{' '}
                    <strong className="text-zinc-900">
                      son vrai avis sans filtre
                    </strong>
                    .
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-stone-200/90 rounded-3xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-hand text-xl text-orange-600 font-bold">
                    ✨ Les pépites du moment
                  </span>
                  <button
                    onClick={() => openListingModal(heroListing)}
                    className="text-xs font-bold text-zinc-900 hover:text-orange-600 flex items-center gap-1 transition"
                  >
                    Ouvrir cette annonce{' '}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {heroMiniCards.map(({ listing, index }) => {
                    const isCurrent = index === safeHeroIndex;
                    return (
                      <div
                        key={listing.id}
                        onClick={() => setHeroIndex(index)}
                        className={`group cursor-pointer relative rounded-2xl overflow-hidden border-2 transition-all duration-300 aspect-[4/3.6] ${
                          isCurrent
                            ? 'border-orange-600 shadow-md scale-[1.02]'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="absolute bottom-1.5 inset-x-1.5 bg-white/95 backdrop-blur-sm text-zinc-900 rounded-xl py-1 px-2 text-center shadow-sm">
                          <span className="block text-[10px] sm:text-[11px] font-extrabold truncate">
                            {listing.sector === 'Campus/La Source'
                              ? 'La Source'
                              : listing.sector}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-4 pt-2 border-t border-stone-200/70">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-zinc-900">
                      {String(safeHeroIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-stone-400">
                      / {String(listings.length).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setHeroIndex(
                          (prev) =>
                            (prev - 1 + listings.length) % listings.length
                        )
                      }
                      className="w-9 h-9 rounded-full bg-white hover:bg-orange-600 text-zinc-800 hover:text-white border border-stone-200 flex items-center justify-center transition shadow-sm"
                      title="Appart précédent"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setHeroIndex((prev) => (prev + 1) % listings.length)
                      }
                      className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-orange-600 text-white flex items-center justify-center transition shadow-sm"
                      title="Appart suivant"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[480px] rounded-[1.8rem] overflow-hidden group">
              <img
                src={heroListing.images[0]}
                alt={heroListing.title}
                onClick={() => openListingModal(heroListing)}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-700"
              />
              <div
                onClick={() => openListingModal(heroListing)}
                className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-black/10 cursor-pointer"
              />

              <div className="absolute top-5 left-5 flex flex-col items-center gap-1.5 z-10">
                <div className="bg-white/95 backdrop-blur-md text-zinc-900 px-2.5 py-4 rounded-full shadow-lg flex items-center justify-center">
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                    }}
                  >
                    {heroListing.sector}
                  </span>
                </div>
                <button
                  onClick={() => openListingModal(heroListing)}
                  className="w-8 h-8 rounded-full bg-zinc-900 text-white hover:bg-orange-600 flex items-center justify-center shadow-lg transition"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute top-5 right-5 z-10">
                <div
                  onClick={() => openListingModal(heroListing)}
                  className="cursor-pointer bg-zinc-900/85 backdrop-blur-md text-white pl-2 pr-4 py-1.5 rounded-full border border-white/15 flex items-center gap-2.5 shadow-lg hover:bg-orange-600 transition"
                >
                  <img
                    src={heroListing.studentAvatar}
                    alt={heroListing.studentName}
                    className="w-7 h-7 rounded-full object-cover border border-orange-400"
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-bold leading-none">
                      {heroListing.studentName}
                    </p>
                    <p className="text-[10px] text-orange-300 font-medium">
                      {heroListing.studentPromo.split('—')[0]}
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => openListingModal(heroListing)}
                className="hidden sm:flex cursor-pointer absolute top-1/3 left-14 z-10 bg-white/95 backdrop-blur-md text-zinc-900 px-4 py-2.5 rounded-2xl shadow-xl items-center gap-2.5 border border-white hover:scale-105 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Trajet Polytech
                  </p>
                  <p className="text-xs font-extrabold text-zinc-900">
                    {heroListing.distanceInfo}
                  </p>
                </div>
              </div>

              <div
                onClick={() => openListingModal(heroListing)}
                className="cursor-pointer absolute top-1/2 right-6 sm:right-10 z-10 bg-white/95 backdrop-blur-md text-zinc-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white hover:scale-105 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-xs">
                  €
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Loyer Charges Comprises
                  </p>
                  <p className="text-sm font-extrabold text-orange-600">
                    {Number(heroListing.rent) + Number(heroListing.charges)} €{' '}
                    <span className="text-xs font-normal text-zinc-500">
                      / mois
                    </span>
                  </p>
                </div>
              </div>

              <div className="absolute bottom-5 inset-x-5 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div
                  onClick={() => openListingModal(heroListing)}
                  className="cursor-pointer max-w-md bg-zinc-950/75 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 block mb-1">
                    {heroListing.type} • {heroListing.surface} m²
                  </span>
                  <h2 className="text-base sm:text-lg font-bold leading-snug line-clamp-1 text-white">
                    {heroListing.title}
                  </h2>
                  <p className="text-xs text-stone-300 italic line-clamp-1 mt-1">
                    « {heroListing.honestReview} »
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 shrink-0">
                  {[
                    heroListing.type,
                    `${heroListing.surface} m²`,
                    heroListing.furnished ? 'Meublé' : 'Non meublé',
                    `DPE ${heroListing.dpe}`,
                  ].map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-white/15 backdrop-blur-md border border-white/25 text-center"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-center">
          <button
            onClick={() => scrollToSection('recherche-section')}
            className="group relative inline-flex items-center gap-3.5 bg-zinc-900 hover:bg-orange-600 text-white px-6 py-3.5 rounded-full shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
          >
            <span className="w-8 h-8 rounded-full bg-orange-500 group-hover:bg-white text-white group-hover:text-orange-600 flex items-center justify-center transition-colors">
              <Search className="w-4 h-4" />
            </span>
            <div className="text-left pr-1">
              <span className="block text-xs sm:text-sm font-extrabold tracking-tight">
                Rechercher & filtrer tous les apparts ({listings.length}{' '}
                logements disponibles)
              </span>
              <span className="block text-[11px] text-stone-300 group-hover:text-orange-100">
                Filtrer par secteur d'Orléans, budget max, studio ou colocation
              </span>
            </div>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center animate-bounce">
              <ArrowDown className="w-4 h-4 text-orange-400 group-hover:text-white" />
            </span>
          </button>
        </div>
      </section>

      <section
        id="recherche-section"
        className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 pb-8"
      >
        <div className="bg-white rounded-3xl sm:rounded-full p-3 sm:px-6 sm:py-3.5 shadow-lg shadow-stone-200/60 border border-stone-200/90">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-3 flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-stone-50 transition border-b sm:border-b-0 sm:border-r border-stone-200/80">
              <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Secteur à Orléans
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-900 focus:outline-none cursor-pointer"
                >
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec === 'Tous' ? 'Tous les secteurs' : sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-3 flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-stone-50 transition border-b sm:border-b-0 lg:border-r border-stone-200/80">
              <Home className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="w-full">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  Type d'appart
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-900 focus:outline-none cursor-pointer"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'Tous' ? 'Studio, Coloc, T2...' : t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="lg:col-span-3 flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-stone-50 transition border-b sm:border-b-0 lg:border-r border-stone-200/80">
              <SlidersHorizontal className="w-5 h-5 text-orange-600 shrink-0" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                    Budget Max CC
                  </label>
                  <span className="text-xs font-extrabold text-orange-600">
                    {maxBudget} €
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="900"
                  step="25"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-orange-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="lg:col-span-3 flex items-center justify-between gap-2 pl-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mot-clé (ex: Tram, jardin, 5A...)"
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-zinc-800 placeholder-stone-400 focus:outline-none"
              />
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-11 h-11 rounded-full bg-zinc-900 hover:bg-orange-600 text-white flex items-center justify-center shrink-0 transition shadow-md"
                title="Filtrer les annonces"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 no-scrollbar">
          <span className="text-xs font-bold text-stone-400 shrink-0 mr-1">
            Accès rapide :
          </span>
          {SECTORS.map((sector) => {
            const active = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  active
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-white text-zinc-600 hover:text-orange-600 border border-stone-200/90'
                }`}
              >
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
                {sector}
              </button>
            );
          })}
        </div>
      </section>

      <main
        id="annonces-section"
        className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pb-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-600 font-hand text-2xl">
              <span>De promo en promo</span>
              <HandDrawnStar className="w-4 h-4" />
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-zinc-900 tracking-tight leading-none mt-1">
              Les apparts transmis par les élèves
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-zinc-500 bg-white px-4 py-2 rounded-full border border-stone-200">
              <strong className="text-orange-600">
                {filteredListings.length}
              </strong>{' '}
              logement
              {filteredListings.length > 1 ? 's' : ''} disponible
              {filteredListings.length > 1 ? 's' : ''}
            </span>
            {(selectedSector !== 'Tous' ||
              selectedType !== 'Tous' ||
              searchQuery !== '' ||
              maxBudget < 750) && (
              <button
                onClick={() => {
                  setSelectedSector('Tous');
                  setSelectedType('Tous');
                  setSearchQuery('');
                  setMaxBudget(750);
                }}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-stone-200 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <Home className="w-7 h-7" />
            </div>
            <h3 className="font-serif-editorial text-3xl text-zinc-900 mb-2">
              Aucun appart sur ce filtre
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              Essaie d'augmenter légèrement le curseur de budget ou de regarder
              les autres secteurs sur la ligne du Tram A.
            </p>
            <button
              onClick={() => {
                setSelectedSector('Tous');
                setSelectedType('Tous');
                setSearchQuery('');
                setMaxBudget(750);
              }}
              className="px-6 py-3 rounded-full bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
            >
              Voir tous les apparts de l'école
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const totalRent = Number(listing.rent) + Number(listing.charges);
              const currentImgIdx = cardImageIndexes[listing.id] || 0;
              const images = listing.images || [];
              const safeImgIdx =
                currentImgIdx < images.length ? currentImgIdx : 0;

              return (
                <article
                  key={listing.id}
                  onClick={() => openListingModal(listing)}
                  className="group cursor-pointer bg-white rounded-[2rem] p-3.5 border border-stone-200/90 hover:border-orange-300 shadow-sm hover:shadow-xl hover:shadow-orange-950/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-60 rounded-[1.4rem] overflow-hidden bg-stone-100">
                      <img
                        src={images[safeImgIdx]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-zinc-900/80 text-white backdrop-blur-md">
                          {listing.type}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/95 text-zinc-900 shadow-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-600" />
                          {listing.sector}
                        </span>
                      </div>

                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleCardPrevImage(e, listing)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-orange-600 text-zinc-900 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCardNextImage(e, listing)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-orange-600 text-zinc-900 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full">
                          <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                          {listing.distanceInfo}
                        </span>

                        {images.length > 1 && (
                          <span className="text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded-full">
                            {safeImgIdx + 1}/{images.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-2 pt-4 pb-2">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                          {listing.surface} m² • Dispo{' '}
                          {new Date(listing.availableFrom).toLocaleDateString(
                            'fr-FR',
                            {
                              day: 'numeric',
                              month: 'short',
                            }
                          )}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-zinc-900">
                            {totalRent} €
                          </span>
                          <span className="text-[11px] text-stone-400 font-semibold">
                            {' '}
                            /mois CC
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-orange-600 transition line-clamp-1 mb-1.5">
                        {listing.title}
                      </h3>

                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-3">
                        « {listing.honestReview} »
                      </p>
                    </div>
                  </div>

                  <div className="px-2 pt-3 pb-1 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={listing.studentAvatar}
                        alt={listing.studentName}
                        className="w-6 h-6 rounded-full object-cover border border-orange-300 shrink-0"
                      />
                      <span className="text-xs font-bold text-zinc-700 truncate">
                        {listing.studentName}{' '}
                        <span className="text-stone-400 font-normal">
                          ({listing.studentPromo.split('—')[0].trim()})
                        </span>
                      </span>
                    </div>

                    <span className="text-xs font-extrabold text-zinc-900 group-hover:text-orange-600 inline-flex items-center gap-1 shrink-0 transition">
                      Voir l'appart
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <section
        id="how-it-works"
        className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pb-20"
      >
        <div className="rounded-[2.2rem] bg-gradient-to-br from-[#9A3412] via-[#C2410C] to-[#EA580C] p-3 sm:p-5 text-white shadow-2xl mb-6">
          <div className="border border-white/25 rounded-[1.7rem] p-6 sm:p-10">
            <div className="text-center max-w-4xl mx-auto">
              <span className="font-hand text-2xl sm:text-3xl text-orange-200 block mb-1">
                Pourquoi on a créé ce site à Polytech Orléans ?
              </span>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-none">
                LA GALÈRE CLASSIQUE QUAND ON ARRIVE À ORLÉANS
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-orange-100/90 mt-3 font-semibold">
                <span>CHERCHER SEUL</span>
                <span>▸</span>
                <span>VISITER DE LOIN</span>
                <span>▸</span>
                <span>PASSER À CÔTÉ DES BONS PLANS DE PROMO</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-10">
              <div className="lg:col-span-4 text-left lg:text-right space-y-2">
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-orange-100">
                  LE VRAI RETOUR D'UN ÉLÈVE QUI Y A VÉCU
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/80 leading-relaxed">
                  Sur une annonce classique, personne ne te dit si l'appart est
                  bien isolé l'hiver, si le Tram A s'entend ou si tu peux aller
                  en cours à Vinci à pied en 6 minutes. Ici, chaque élève laisse
                  son avis honnête.
                </p>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-full max-w-xs aspect-[4/3] rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
                    alt="Intérieur étudiant chaleureux"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 inset-x-3 text-left">
                    <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white text-[10px] font-extrabold uppercase">
                      Transmission directe
                    </span>
                    <p className="text-xs font-bold text-white mt-1">
                      De PeiP à 5A, on se passe les clés !
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 text-left space-y-2">
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-orange-100">
                  GESTION SIMPLE PAR CODE SECRET
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/80 leading-relaxed">
                  Pas besoin de créer un compte : quand tu postes ton appart, tu
                  choisis un petit code secret. Dès que ton logement est repris
                  par un élève, tu le retires du site en 5 secondes !
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/25">
              <div className="flex items-center gap-3 border-r border-white/15 pr-3">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                  100%
                </span>
                <span className="text-[11px] text-orange-100/85 leading-tight">
                  Entre élèves de Polytech Orléans
                </span>
              </div>
              <div className="flex items-center gap-3 lg:border-r border-white/15 pr-3">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                  06
                </span>
                <span className="text-[11px] text-orange-100/85 leading-tight">
                  Secteurs clés d'Orléans & Olivet couverts
                </span>
              </div>
              <div className="flex items-center gap-3 border-r border-white/15 pr-3">
                <span className="font-display text-2xl sm:text-4xl font-extrabold text-white">
                  2<span className="text-base font-normal">min</span>
                </span>
                <span className="text-[11px] text-orange-100/85 leading-tight">
                  Pour déposer ses photos en glisser-déposer
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  Direct
                </span>
                <span className="text-[11px] text-orange-100/85 leading-tight">
                  Échange WhatsApp & téléphone sans compte
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2.2rem] bg-zinc-950 text-white p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-block relative mb-3">
                <span className="font-hand text-2xl sm:text-3xl text-orange-400 px-3 py-1">
                  Comment ça marche ?
                </span>
                <HandDrawnOval className="absolute inset-0 w-full h-full" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-tight mt-2">
                TU QUITTES TON APPART OU TU CHERCHES POUR LA RENTRÉE ?
              </h3>
            </div>

            <div className="space-y-5 my-6">
              <div className="flex items-start gap-4 border-b border-zinc-800 pb-4">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-orange-500 w-14 shrink-0">
                  01.
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Repère un appart sur Campus/La Source, Centre, Gare,
                    Saint-Marceau ou Olivet
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Fais défiler les photos directement sur les cartes et lis le
                    mot laissé par l'élève qui occupe le logement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-b border-zinc-800 pb-4">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-orange-500 w-14 shrink-0">
                  02.
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Écris-lui directement sur WhatsApp en un clic
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pas de formulaire qui se perd : tu récupères son numéro ou
                    tu lances la discussion WhatsApp pré-remplie pour organiser
                    une visite.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-orange-500 w-14 shrink-0">
                  03.
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Modifie ou retire ton annonce avec ton code secret
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Une fois ton remplaçant trouvé, clique sur « Modifier /
                    Supprimer » dans ta fiche et entre ton code secret pour
                    retirer l'annonce.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <OrangeAsterisk className="w-4 h-4 text-orange-500 shrink-0" />
              <span>
                Initiative d'entraide entre élèves de Polytech Orléans — PeiP,
                3A, 4A & 5A.
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#C2410C] rounded-[1.7rem] p-5 sm:p-6 flex flex-col justify-between text-white">
            <div className="rounded-2xl overflow-hidden h-48 sm:h-56 mb-5 border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
                alt="Appartement étudiant Orléans"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-200">
                TU PARS EN STAGE OU EN ÉCHANGE ?
              </span>
              <h4 className="font-display text-xl sm:text-2xl font-extrabold uppercase mt-1 mb-2">
                PASSE TON APPART À UN ÉLÈVE DE L'ÉCOLE
              </h4>
              <p className="text-xs text-orange-100/90 leading-relaxed mb-5">
                Glisse-dépose quelques photos de ton logement, choisis un code
                secret et aide un nouvel arrivant à s'installer sereinement à
                Orléans.
              </p>
              <button
                onClick={openCreateModal}
                className="w-full py-3.5 px-5 rounded-full bg-zinc-950 hover:bg-white text-white hover:text-zinc-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Déposer mon annonce maintenant
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2 font-display font-extrabold text-zinc-900 text-base">
            <span>P</span>
            <OrangeAsterisk className="w-4 h-4 text-orange-600" />
            <span>SSE ton APPART</span>
            <span className="text-xs font-sans font-semibold text-orange-600 ml-1">
              • Polytech Orléans
            </span>
          </div>

          <div>
            <p className="text-xs text-stone-400">
              Plateforme d'entraide étudiante sans frais d'agence. Fait par et
              pour les élèves.
            </p>
          </div>
        </div>
      </footer>

      {selectedListing && (
        <div
          onClick={() => setSelectedListing(null)}
          className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[2rem] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative"
          >
            <div className="relative h-72 sm:h-96 bg-zinc-900 overflow-hidden">
              <img
                src={
                  selectedListing.images[modalImageIndex] ||
                  selectedListing.images[0]
                }
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

              <button
                onClick={() => setSelectedListing(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-orange-600 text-zinc-900 hover:text-white flex items-center justify-center shadow-lg transition z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-orange-600 text-white shadow-md">
                  {selectedListing.sector}
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-zinc-900/80 text-white backdrop-blur-md">
                  {selectedListing.type}
                </span>
              </div>

              {selectedListing.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setModalImageIndex(
                        (prev) =>
                          (prev - 1 + selectedListing.images.length) %
                          selectedListing.images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-orange-600 text-zinc-900 hover:text-white flex items-center justify-center shadow-xl transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() =>
                      setModalImageIndex(
                        (prev) => (prev + 1) % selectedListing.images.length
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-orange-600 text-zinc-900 hover:text-white flex items-center justify-center shadow-xl transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 inset-x-6 flex items-end justify-between gap-4 text-white">
                <div className="text-left">
                  <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedListing.address}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold leading-tight text-white">
                    {selectedListing.title}
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md shrink-0">
                  Photo {modalImageIndex + 1} / {selectedListing.images.length}
                </span>
              </div>
            </div>

            {selectedListing.images.length > 1 && (
              <div className="bg-white px-6 py-3 border-b border-stone-200 flex items-center gap-2.5 overflow-x-auto">
                {selectedListing.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setModalImageIndex(idx)}
                    className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      idx === modalImageIndex
                        ? 'border-orange-600 scale-105 shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Loyer CC
                    </span>
                    <span className="text-lg font-extrabold text-orange-600">
                      {Number(selectedListing.rent) +
                        Number(selectedListing.charges)}{' '}
                      €
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      ({selectedListing.rent}€ + {selectedListing.charges}€ ch.)
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Surface
                    </span>
                    <span className="text-lg font-extrabold text-zinc-900">
                      {selectedListing.surface} m²
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      DPE {selectedListing.dpe}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Disponibilité
                    </span>
                    <span className="text-sm font-extrabold text-zinc-900">
                      {new Date(
                        selectedListing.availableFrom
                      ).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      Reprise directe
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block">
                      Distance école
                    </span>
                    <span className="text-xs font-extrabold text-zinc-900">
                      {selectedListing.distanceInfo}
                    </span>
                    <span className="block text-[10px] text-orange-600 font-semibold">
                      Polytech Orléans
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50/90 border border-orange-200 rounded-3xl p-5 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={selectedListing.studentAvatar}
                      alt={selectedListing.studentName}
                      className="w-11 h-11 rounded-full object-cover border-2 border-orange-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-orange-700 block">
                        Le vrai retour sans filtre de{' '}
                        {selectedListing.studentName}
                      </span>
                      <span className="text-xs text-zinc-600 font-medium">
                        {selectedListing.studentPromo}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-800 leading-relaxed italic">
                    « {selectedListing.honestReview} »
                  </p>
                  <div className="mt-3 pt-3 border-t border-orange-200/70 flex items-center justify-between text-xs text-orange-800 font-semibold">
                    <span>
                      Modalité de reprise : {selectedListing.repriseInfo}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-3">
                    Équipements & petits plus de l'appart
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.amenities.map((am) => (
                      <span
                        key={am}
                        className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-zinc-800 flex items-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-orange-600" />
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200">
                  {!showManagePanel ? (
                    <button
                      type="button"
                      onClick={() => setShowManagePanel(true)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-orange-600 bg-white hover:bg-orange-50 px-4 py-2.5 rounded-full border border-stone-200 transition"
                    >
                      <Lock className="w-3.5 h-3.5 text-orange-600" />
                      C'est mon annonce : Modifier ou Supprimer
                    </button>
                  ) : (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-orange-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <Unlock className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-orange-600" />
                          )}
                          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
                            {isUnlocked
                              ? 'Annonce déverrouillée'
                              : 'Déverrouiller la gestion de cette annonce'}
                          </span>
                          {unlockedAsAdmin && (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-orange-400 text-[10px] font-extrabold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Mode Admin
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowManagePanel(false);
                            setCodeError('');
                            setConfirmDeleteStep(false);
                          }}
                          className="text-xs text-zinc-400 hover:text-zinc-700"
                        >
                          Fermer
                        </button>
                      </div>

                      {!isUnlocked ? (
                        <form
                          onSubmit={handleVerifySecretCode}
                          className="space-y-2.5"
                        >
                          <p className="text-xs text-zinc-500">
                            Entre le <strong>code secret</strong> choisi lors du
                            dépôt de l'annonce (ou le code Admin BDE) pour la
                            modifier ou la retirer du site.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="password"
                              value={enteredCode}
                              onChange={(e) => setEnteredCode(e.target.value)}
                              placeholder="Ton code secret..."
                              className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold focus:outline-none focus:border-orange-500"
                            />
                            <button
                              type="submit"
                              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-orange-600 text-white text-xs font-extrabold transition shrink-0"
                            >
                              Déverrouiller
                            </button>
                          </div>
                          {codeError && (
                            <p className="text-xs text-red-600 font-semibold">
                              {codeError}
                            </p>
                          )}
                        </form>
                      ) : (
                        <div className="space-y-3">
                          {!confirmDeleteStep ? (
                            <div className="flex flex-col sm:flex-row gap-2.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModalFromListing(selectedListing)
                                }
                                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-sm"
                              >
                                <Edit3 className="w-4 h-4" />
                                Modifier les infos / photos
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteStep(true)}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 text-xs font-extrabold flex items-center justify-center gap-2 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer (Appart repris !)
                              </button>
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-3">
                              <div className="flex items-center gap-2 text-red-700 text-xs font-bold">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>
                                  Confirmer la suppression définitive de cette
                                  annonce ?
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteListing(selectedListing.id)
                                  }
                                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition"
                                >
                                  Oui, supprimer l'appart
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteStep(false)}
                                  className="px-4 py-2 rounded-lg bg-white border border-stone-200 text-zinc-700 text-xs font-bold"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                      Contact direct élève
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {selectedListing.createdAt}
                    </span>
                  </div>

                  <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-extrabold text-zinc-900">
                        {selectedListing.studentPhone}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyPhone(
                          selectedListing.studentPhone,
                          selectedListing.id
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-600 text-zinc-800 hover:text-white border border-stone-200 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      {copiedPhoneId === selectedListing.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copié
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copier
                        </>
                      )}
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => handleSendQuickContact(e, selectedListing)}
                    className="space-y-3 pt-2"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                        Ton prénom & ta promo (ex: Tom - futur 3A)
                      </label>
                      <input
                        type="text"
                        required
                        value={contactSenderName}
                        onChange={(e) => setContactSenderName(e.target.value)}
                        placeholder="Ex: Camille (PeiP2)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                        Petit mot pour {selectedListing.studentName}
                      </label>
                      <textarea
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Salut ! Ton appart m'intéresse beaucoup pour la rentrée, dispo pour une visite ou un appel ?"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contacter sur WhatsApp
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPublishModalOpen && (
        <div
          onClick={() => setIsPublishModalOpen(false)}
          className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[2rem] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <span className="font-hand text-2xl text-orange-600 block">
                  {editingListingId
                    ? 'Mise à jour de ton annonce'
                    : 'Entraide Polytech Orléans'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
                  {editingListingId
                    ? '✏️ Modifier mon appartement'
                    : 'Passer mon appart à un élève'}
                </h2>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-orange-600 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                    Titre de l'annonce *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ex: Grand studio meublé à 5 min de Vinci"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
                  >
                    <option value="Studio / T1">Studio / T1</option>
                    <option value="Colocation">Colocation</option>
                    <option value="T2 / Deux pièces">T2 / Deux pièces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                    Secteur *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-sm font-semibold focus:outline-none focus:border-orange-500"
                  >
                    {SECTORS.filter((s) => s !== 'Tous').map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                    Rue ou arrêt de Tram proche
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Ex: Avenue du Parc Floral / Arrêt Chèques Postaux"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Loyer HC (€) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.rent}
                    onChange={(e) =>
                      setFormData({ ...formData, rent: e.target.value })
                    }
                    placeholder="380"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Charges (€)
                  </label>
                  <input
                    type="number"
                    value={formData.charges}
                    onChange={(e) =>
                      setFormData({ ...formData, charges: e.target.value })
                    }
                    placeholder="40"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.surface}
                    onChange={(e) =>
                      setFormData({ ...formData, surface: e.target.value })
                    }
                    placeholder="26"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Dispo dès le
                  </label>
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableFrom: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-zinc-700">
                    Photos de l'appart (Glisser-déposer plusieurs photos)
                  </label>
                  <span className="text-[11px] font-bold text-orange-600">
                    {formData.images.length} photo
                    {formData.images.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition ${
                    isDragging
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-stone-300 bg-white hover:border-orange-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="w-7 h-7 text-orange-600 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-zinc-800">
                    {isCompressingPhotos
                      ? 'Optimisation des photos en cours...'
                      : 'Glisse tes photos ici ou clique pour parcourir tes fichiers'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Compression automatique intégrée pour un chargement
                    ultra-rapide
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] text-zinc-400">
                    Pas de photo sous la main ?
                  </span>
                  {QUICK_SAMPLE_PHOTOS.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          images: [...prev.images, sample.url],
                        }))
                      }
                      className="text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-full transition"
                    >
                      + {sample.label}
                    </button>
                  ))}
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
                    {formData.images.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden h-24 border-2 ${
                          idx === 0 ? 'border-orange-600' : 'border-stone-200'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 ? (
                          <span className="absolute bottom-1 left-1 bg-orange-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                            Principale ⭐
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsMainImage(idx)}
                            className="absolute bottom-1 left-1 bg-black/70 hover:bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md"
                          >
                            Mettre en 1er
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-2">
                  Équipements inclus
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map(({ label }) => {
                    const selected = formData.amenities.includes(label);
                    return (
                      <button
                        type="button"
                        key={label}
                        onClick={() => toggleAmenityInForm(label)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                          selected
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-zinc-600 border-stone-200 hover:border-orange-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Ton prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    placeholder="Ex: Thomas B."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Ta promo & raison du départ
                  </label>
                  <input
                    type="text"
                    value={formData.studentPromo}
                    onChange={(e) =>
                      setFormData({ ...formData, studentPromo: e.target.value })
                    }
                    placeholder="Ex: 4A MECA — Départ stage"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Téléphone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, studentPhone: e.target.value })
                    }
                    placeholder="06 12 34 56 78"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Temps de trajet jusqu'à Polytech
                  </label>
                  <input
                    type="text"
                    value={formData.distanceInfo}
                    onChange={(e) =>
                      setFormData({ ...formData, distanceInfo: e.target.value })
                    }
                    placeholder="Ex: 7 min à pied de Vinci / 15 min Tram A"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                    Comment se passe la reprise ?
                  </label>
                  <input
                    type="text"
                    value={formData.repriseInfo}
                    onChange={(e) =>
                      setFormData({ ...formData, repriseInfo: e.target.value })
                    }
                    placeholder="Ex: Proprio particulier sympa, je lui passe ton dossier"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1">
                  Ton avis honnête sur l'appart (voisins, isolation,
                  ambiance...)
                </label>
                <textarea
                  rows={3}
                  value={formData.honestReview}
                  onChange={(e) =>
                    setFormData({ ...formData, honestReview: e.target.value })
                  }
                  placeholder="Dis aux autres élèves ce qui est vraiment cool dans cet appart !"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="bg-orange-50/90 border-2 border-orange-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <label className="text-xs font-extrabold uppercase tracking-wider text-orange-800">
                    Code secret de ton annonce (obligatoire) *
                  </label>
                </div>
                <p className="text-xs text-zinc-600 mb-3">
                  Comme il n'y a pas de compte à créer, ce code te permettra de{' '}
                  <strong>modifier ton annonce</strong> ou de{' '}
                  <strong>la supprimer</strong> dès que ton appart est repris !
                </p>
                <div className="relative max-w-xs">
                  <input
                    type={showSecretInForm ? 'text' : 'password'}
                    required
                    value={formData.secretCode}
                    onChange={(e) =>
                      setFormData({ ...formData, secretCode: e.target.value })
                    }
                    placeholder="Ex: 4510 ou moncode"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-orange-300 text-sm font-extrabold text-zinc-900 focus:outline-none focus:border-orange-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretInForm(!showSecretInForm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-orange-600"
                  >
                    {showSecretInForm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-lg transition"
              >
                {editingListingId
                  ? 'Enregistrer les modifications'
                  : "Publier mon appart pour les élèves de l'école"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
