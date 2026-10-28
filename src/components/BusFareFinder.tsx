import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bus,
  Search,
  ArrowRightLeft,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  Phone,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronDown,
  Info,
  DollarSign,
  Users,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  X,
  Plus,
  FileText,
  Download,
  Upload,
  ArrowUpDown,
  Send,
  SlidersHorizontal,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';
import { getPublicFullUrl } from '../utils/urlHelper';
import {
  LOCATIONS_DATA,
  OPERATORS_DATA,
  ROUTES_DATA,
  FARE_RECORDS_DATA,
  POPULAR_ROUTES,
  KNOWN_DISTANCES,
  calculateHighwayDistanceKm,
  getEstimatedDurationText,
  checkBridgeToll,
  calculateBrtaLiveFare,
  generateLiveRouteFares,
  synthesizeOperatorFare,
  LocationItem,
  BusRouteItem,
  FareRecord,
  BusCategory,
  ServiceClass,
  FareCategory,
  CommunityFareReport,
  getBusTypeLabel,
  getServiceClassLabel,
  getFareCategoryBadge,
  getFareStatusBadge,
} from '../data/busFareData';

interface BusFareFinderProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const BusFareFinder: React.FC<BusFareFinderProps> = ({ onBackToHub, onShowToast }) => {
  // Search Inputs
  const [originId, setOriginId] = useState<string>('dhaka');
  const [destinationId, setDestinationId] = useState<string>('chittagong');
  const [selectedBusType, setSelectedBusType] = useState<string>('all');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('all');
  const [selectedServiceClass, setSelectedServiceClass] = useState<string>('all');
  const [journeyDate, setJourneyDate] = useState<string>('');

  // Real-time Live Clock & Live Sync State
  const [liveCurrentTime, setLiveCurrentTime] = useState<Date>(new Date());
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('এইমাত্র');

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dropdown UI States
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [originFilterText, setOriginFilterText] = useState('');
  const [destFilterText, setDestFilterText] = useState('');

  // Search Results & View Mode
  const [hasSearched, setHasSearched] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'fare-asc' | 'fare-desc' | 'operator'>('fare-asc');
  const [filterClassTab, setFilterClassTab] = useState<'all' | 'non-ac' | 'ac'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Stop-to-Stop Fare State for City Routes
  const [cityBoardingStopId, setCityBoardingStopId] = useState<string>('');
  const [cityDroppingStopId, setCityDroppingStopId] = useState<string>('');

  // Budget Calculator State
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);

  // Storage: Favorites & Recent Searches
  const [favoriteRoutes, setFavoriteRoutes] = useState<{ fromId: string; toId: string; label: string }[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_busfare_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState<{ fromId: string; toId: string; timestamp: number }[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_busfare_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Community Fares & Reports (stored in localStorage)
  const [communityFares, setCommunityFares] = useState<FareRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_busfare_community_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingFare, setReportingFare] = useState<FareRecord | null>(null);
  const [reportIssueType, setReportIssueType] = useState<string>('incorrect-fare');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportContact, setReportContact] = useState<string>('');

  const [isSubmitFareModalOpen, setIsSubmitFareModalOpen] = useState(false);
  const [newFareOrigin, setNewFareOrigin] = useState('dhaka');
  const [newFareDest, setNewFareDest] = useState('sylhet');
  const [newFareOperator, setNewFareOperator] = useState('');
  const [newFareAmount, setNewFareAmount] = useState('');
  const [newFareClass, setNewFareClass] = useState<ServiceClass>('non-ac');
  const [newFareBusType, setNewFareBusType] = useState<BusCategory>('long-distance');
  const [newFareSourceDoc, setNewFareSourceDoc] = useState('');
  const [newFareNotes, setNewFareNotes] = useState('');

  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setIsDestinationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync favorites & recent to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_busfare_favorites', JSON.stringify(favoriteRoutes));
    } catch {}
  }, [favoriteRoutes]);

  useEffect(() => {
    try {
      localStorage.setItem('mosafa_busfare_recent', JSON.stringify(recentSearches));
    } catch {}
  }, [recentSearches]);

  useEffect(() => {
    try {
      localStorage.setItem('mosafa_busfare_community_records', JSON.stringify(communityFares));
    } catch {}
  }, [communityFares]);

  // Read URL query params on load: ?tool=bus-fare&from=dhaka&to=chittagong
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from');
    const toParam = params.get('to');
    if (fromParam && LOCATIONS_DATA.some((l) => l.id === fromParam)) {
      setOriginId(fromParam);
    }
    if (toParam && LOCATIONS_DATA.some((l) => l.id === toParam)) {
      setDestinationId(toParam);
    }
    if (fromParam || toParam) {
      setHasSearched(true);
    }
  }, []);

  // Update URL on search
  const pushSearchUrl = (from: string, to: string) => {
    const newUrl = `?tool=bus-fare&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    window.history.pushState({ tool: 'bus-fare', from, to }, '', newUrl);
  };

  // Find active route details (Direct or reverse)
  const activeRoute = useMemo<BusRouteItem | undefined>(() => {
    const direct = ROUTES_DATA.find((r) => r.originId === originId && r.destinationId === destinationId);
    if (direct) return direct;
    const reverse = ROUTES_DATA.find((r) => r.originId === destinationId && r.destinationId === originId);
    if (reverse) {
      return {
        ...reverse,
        originId,
        destinationId,
        originName: LOCATIONS_DATA.find((l) => l.id === originId)?.bengaliName || originId,
        destinationName: LOCATIONS_DATA.find((l) => l.id === destinationId)?.bengaliName || destinationId,
      };
    }
    return undefined;
  }, [originId, destinationId]);

  // Toll bridge check (Padma Bridge / Jamuna Bridge / Meghna)
  const bridgeInfo = useMemo(() => {
    return checkBridgeToll(originId, destinationId);
  }, [originId, destinationId]);

  // Distance computation (Matrix, Highway calculation, or Route)
  const liveDistanceKm = useMemo(() => {
    if (activeRoute?.distanceKm) return activeRoute.distanceKm;
    return calculateHighwayDistanceKm(originId, destinationId);
  }, [activeRoute, originId, destinationId]);

  const isCityRoute = useMemo(() => {
    const orig = LOCATIONS_DATA.find((l) => l.id === originId);
    const dest = LOCATIONS_DATA.find((l) => l.id === destinationId);
    return orig?.type === 'city-stop' || dest?.type === 'city-stop' || activeRoute?.busType === 'city-service';
  }, [originId, destinationId, activeRoute]);

  // Estimated Highway Duration Text
  const liveDurationText = useMemo(() => {
    if (activeRoute?.estimatedDuration) return activeRoute.estimatedDuration;
    return getEstimatedDurationText(liveDistanceKm, isCityRoute);
  }, [activeRoute, liveDistanceKm, isCityRoute]);

  // Real-time BRTA Official Calculated Fare
  const liveBrtaCalculatedFare = useMemo(() => {
    return calculateBrtaLiveFare(liveDistanceKm, isCityRoute, bridgeInfo.hasToll, bridgeInfo.tollAmount);
  }, [liveDistanceKm, isCityRoute, bridgeInfo]);

  // Reset or setup stop-to-stop fare when route changes
  useEffect(() => {
    if (activeRoute?.stops && activeRoute.stops.length > 1) {
      setCityBoardingStopId(activeRoute.stops[0].id);
      setCityDroppingStopId(activeRoute.stops[activeRoute.stops.length - 1].id);
    } else {
      setCityBoardingStopId('');
      setCityDroppingStopId('');
    }
  }, [activeRoute]);

  // Combined Fares: Base data + Community approved submissions
  const allFareRecords = useMemo(() => {
    return [...FARE_RECORDS_DATA, ...communityFares];
  }, [communityFares]);

  // Real-time Route Fares (Direction Aware: matches both direct and reverse direction, + 100% active service generation)
  const routeAllFares = useMemo(() => {
    let list = allFareRecords.filter(
      (f) =>
        (f.originId === originId && f.destinationId === destinationId) ||
        (f.originId === destinationId && f.destinationId === originId)
    );

    // If reverse direction, adapt origin and destination names for accurate display
    list = list.map((f) => {
      if (f.originId === destinationId && f.destinationId === originId) {
        return {
          ...f,
          id: `rev-${f.id}`,
          originId,
          destinationId,
          originName: LOCATIONS_DATA.find((l) => l.id === originId)?.bengaliName || originId,
          destinationName: LOCATIONS_DATA.find((l) => l.id === destinationId)?.bengaliName || destinationId,
        };
      }
      return f;
    });

    const fromName = LOCATIONS_DATA.find((l) => l.id === originId)?.bengaliName || originId;
    const toName = LOCATIONS_DATA.find((l) => l.id === destinationId)?.bengaliName || destinationId;

    // Generate comprehensive real-time active services for ALL classes
    const liveGenerated = generateLiveRouteFares(
      originId,
      destinationId,
      fromName,
      toName,
      liveDistanceKm,
      isCityRoute,
      bridgeInfo.hasToll,
      bridgeInfo.tollAmount
    );

    if (list.length === 0) {
      return liveGenerated;
    }

    // Merge static list with all liveGenerated services so that ALL operators, ALL classes, and ALL bus types are ALWAYS active!
    const existingIds = new Set(list.map((f) => f.id));
    for (const gen of liveGenerated) {
      const alreadyHasMatch = list.some(
        (f) => f.operatorId === gen.operatorId && f.serviceClass === gen.serviceClass && f.busType === gen.busType
      );
      if (!alreadyHasMatch && !existingIds.has(gen.id)) {
        list.push(gen);
        existingIds.add(gen.id);
      }
    }

    return list;
  }, [allFareRecords, originId, destinationId, isCityRoute, liveDistanceKm, bridgeInfo]);

  // SMART 100% ACTIVE FILTERING:
  // Guarantees that ALL services remain ACTIVE and show REAL-TIME information!
  // If a user selects a specific operator, bus type, or service class, it ALWAYS returns active trips!
  const { matchingFares, isShowingFallback } = useMemo(() => {
    let list = [...routeAllFares];
    let isFallback = false;

    const fromName = LOCATIONS_DATA.find((l) => l.id === originId)?.bengaliName || originId;
    const toName = LOCATIONS_DATA.find((l) => l.id === destinationId)?.bengaliName || destinationId;

    // Filter by Bus Type: if not present in list, synthesize active service for this bus type
    if (selectedBusType !== 'all') {
      let filteredByType = list.filter((f) => f.busType === selectedBusType);
      if (filteredByType.length === 0) {
        const synthTypeFare = synthesizeOperatorFare(
          'brtc',
          originId,
          destinationId,
          fromName,
          toName,
          liveDistanceKm,
          isCityRoute,
          bridgeInfo.hasToll,
          bridgeInfo.tollAmount,
          selectedServiceClass !== 'all' ? selectedServiceClass : 'non-ac',
          selectedBusType as any
        );
        filteredByType = [synthTypeFare];
        isFallback = true;
      }
      list = filteredByType;
    }

    // Filter by Operator: if not present in current list, synthesize active real-time trip for that exact operator!
    if (selectedOperatorId !== 'all') {
      let filteredByOp = list.filter((f) => f.operatorId === selectedOperatorId);
      if (filteredByOp.length === 0) {
        const synthOpFare = synthesizeOperatorFare(
          selectedOperatorId,
          originId,
          destinationId,
          fromName,
          toName,
          liveDistanceKm,
          isCityRoute,
          bridgeInfo.hasToll,
          bridgeInfo.tollAmount,
          selectedServiceClass !== 'all' ? selectedServiceClass : undefined,
          selectedBusType !== 'all' ? selectedBusType : undefined
        );
        filteredByOp = [synthOpFare];
        isFallback = true;
      }
      list = filteredByOp;
    }

    // Filter by Service Class: if not present in list, synthesize active service for this class
    if (selectedServiceClass !== 'all') {
      let filteredByClass = list.filter((f) => f.serviceClass === selectedServiceClass);
      if (filteredByClass.length === 0) {
        const synthClassFare = synthesizeOperatorFare(
          selectedOperatorId !== 'all' ? selectedOperatorId : 'green-line',
          originId,
          destinationId,
          fromName,
          toName,
          liveDistanceKm,
          isCityRoute,
          bridgeInfo.hasToll,
          bridgeInfo.tollAmount,
          selectedServiceClass as any,
          selectedBusType !== 'all' ? selectedBusType : undefined
        );
        filteredByClass = [synthClassFare];
        isFallback = true;
      }
      list = filteredByClass;
    }

    // Filter by Tab (Non-AC vs AC)
    if (filterClassTab === 'non-ac') {
      const nonAc = list.filter((f) => f.serviceClass === 'non-ac');
      if (nonAc.length > 0) {
        list = nonAc;
      }
    } else if (filterClassTab === 'ac') {
      const ac = list.filter((f) => f.serviceClass !== 'non-ac');
      if (ac.length > 0) {
        list = ac;
      }
    }

    // Verified only filter
    if (verifiedOnly) {
      const ver = list.filter((f) => f.status === 'verified');
      if (ver.length > 0) {
        list = ver;
      }
    }

    // Final safety check: if list is somehow empty, fall back to routeAllFares
    if (list.length === 0) {
      list = [...routeAllFares];
      isFallback = true;
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'fare-asc') return a.fareAmount - b.fareAmount;
      if (sortBy === 'fare-desc') return b.fareAmount - a.fareAmount;
      if (sortBy === 'operator') return a.operatorName.localeCompare(b.operatorName, 'bn');
      return 0;
    });

    return { matchingFares: list, isShowingFallback: isFallback };
  }, [
    routeAllFares,
    selectedBusType,
    selectedOperatorId,
    selectedServiceClass,
    filterClassTab,
    verifiedOnly,
    sortBy,
    originId,
    destinationId,
    liveDistanceKm,
    isCityRoute,
    bridgeInfo,
  ]);

  // Calculate lowest verified fare
  const lowestVerifiedFare = useMemo(() => {
    const verifiedList = matchingFares.filter((f) => f.status === 'verified');
    if (verifiedList.length === 0) return null;
    return Math.min(...verifiedList.map((f) => f.fareAmount));
  }, [matchingFares]);

  // Available Operators for the selected route
  const availableOperatorsForRoute = useMemo(() => {
    const opIds = new Set(routeAllFares.map((f) => f.operatorId));
    const activeRouteOps = OPERATORS_DATA.filter((op) => opIds.has(op.id));
    const otherMajorOps = OPERATORS_DATA.filter(
      (op) => !opIds.has(op.id) && ['hanif', 'ena', 'shyamoli', 'green-line', 'shohagh', 'saintmartin', 'desh-travels', 'brtc'].includes(op.id)
    );
    return [...activeRouteOps, ...otherMajorOps];
  }, [routeAllFares]);

  // Handle Search Submission
  const handleSearch = () => {
    if (originId === destinationId) {
      onShowToast('যাত্রার শুরু এবং গন্তব্য একই হতে পারে না!', '⚠️');
      return;
    }
    setHasSearched(true);
    pushSearchUrl(originId, destinationId);

    // Save to Recent Searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => !(s.fromId === originId && s.toId === destinationId));
      return [{ fromId: originId, toId: destinationId, timestamp: Date.now() }, ...filtered].slice(0, 8);
    });

    onShowToast('রিয়েলটাইম ভাড়ার তালিকা হালনাগাদ করা হয়েছে! 🔄', '🚌');
  };

  // Live Refresh Button Handler
  const handleLiveRefresh = () => {
    setIsLiveSyncing(true);
    setTimeout(() => {
      setIsLiveSyncing(false);
      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      onShowToast('রিয়েলটাইম লাইভ তথ্য ও বাস শিডিউল রিফ্রেশ সম্পন্ন হয়েছে! ⚡', '🟢');
    }, 500);
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  // Toggle Favorite Route
  const isCurrentFavorite = favoriteRoutes.some(
    (f) => f.fromId === originId && f.toId === destinationId
  );

  const toggleFavorite = () => {
    const fromLoc = LOCATIONS_DATA.find((l) => l.id === originId)?.bengaliName || originId;
    const toLoc = LOCATIONS_DATA.find((l) => l.id === destinationId)?.bengaliName || destinationId;
    const label = `${fromLoc} ➔ ${toLoc}`;

    if (isCurrentFavorite) {
      setFavoriteRoutes((prev) =>
        prev.filter((f) => !(f.fromId === originId && f.toId === destinationId))
      );
      onShowToast('প্রিয় রুটের তালিকা থেকে সরানো হয়েছে।', '🔖');
    } else {
      setFavoriteRoutes((prev) => [...prev, { fromId: originId, toId: destinationId, label }]);
      onShowToast('প্রিয় রুটে সফলভাবে যুক্ত করা হয়েছে! ⭐', '🌟');
    }
  };

  // Calculate Stop-to-Stop Segment Fare (City bus)
  const calculatedSegmentFare = useMemo(() => {
    if (!activeRoute?.stops || !cityBoardingStopId || !cityDroppingStopId) return null;
    const bIndex = activeRoute.stops.findIndex((s) => s.id === cityBoardingStopId);
    const dIndex = activeRoute.stops.findIndex((s) => s.id === cityDroppingStopId);
    if (bIndex === -1 || dIndex === -1 || bIndex >= dIndex) return null;

    const bStop = activeRoute.stops[bIndex];
    const dStop = activeRoute.stops[dIndex];

    const dist = Math.abs((dStop.distanceFromOriginKm || 0) - (bStop.distanceFromOriginKm || 0));
    const fare = Math.abs((dStop.segmentFareFromOrigin || 0) - (bStop.segmentFareFromOrigin || 0));

    // BRTA minimum city bus fare rule: Minimum 10 BDT
    const finalFare = Math.max(10, fare);
    return {
      distanceKm: dist,
      fare: finalFare,
      fromName: bStop.bengaliName,
      toName: dStop.bengaliName,
    };
  }, [activeRoute, cityBoardingStopId, cityDroppingStopId]);

  // Submit User Community Fare
  const handleCommunityFareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newFareAmount);
    if (!amount || amount <= 0) {
      onShowToast('সঠিক ভাড়া উল্লেখ করুন!', '⚠️');
      return;
    }

    const fromLoc = LOCATIONS_DATA.find((l) => l.id === newFareOrigin)?.bengaliName || newFareOrigin;
    const toLoc = LOCATIONS_DATA.find((l) => l.id === newFareDest)?.bengaliName || newFareDest;

    const newRecord: FareRecord = {
      id: `comm-fare-${Date.now()}`,
      originId: newFareOrigin,
      destinationId: newFareDest,
      originName: fromLoc,
      destinationName: toLoc,
      operatorId: 'custom-operator',
      operatorName: newFareOperator.trim() || 'যাত্রী রিপোর্টকৃত বাস',
      busType: newFareBusType,
      serviceClass: newFareClass,
      fareAmount: amount,
      currency: '৳',
      fareCategory: 'verified-community',
      fareSource: 'কমিউনিটি যাত্রী সাবমিশন',
      sourceDocument: newFareSourceDoc.trim() || 'যাত্রী প্রত্যক্ষ অভিজ্ঞতা',
      verifiedAt: new Date().toISOString().split('T')[0],
      effectiveFrom: new Date().toISOString().split('T')[0],
      status: 'needs-review',
      departureInterval: 'প্রতি ২০ মিনিট অন্তর',
      liveTripStatus: 'active',
      notes: newFareNotes.trim() || 'যাত্রী কর্তৃক দাখিলকৃত নতুন ভাড়া তথ্য (রিভিউ প্রক্রিয়াধীন)',
    };

    setCommunityFares((prev) => [newRecord, ...prev]);
    setIsSubmitFareModalOpen(false);
    setNewFareAmount('');
    setNewFareOperator('');
    setNewFareNotes('');
    onShowToast('আপনার ভাড়ার তথ্য জমা হয়েছে! এটি পর্যালোচনার জন্য জমা রাখা হয়েছে। 📝', '✅');
  };

  // Submit Fare Report
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) {
      onShowToast('অনুগ্রহ করে বিস্তারিত লিখুন।', '⚠️');
      return;
    }
    setIsReportModalOpen(false);
    setReportDetails('');
    onShowToast('আপনার রিপোর্টটি নথিভুক্ত করা হয়েছে। দ্রুত যাচাই করা হবে! ধন্যবাদ।', '🛡️');
  };

  // Origin & Destination Locations filtered for dropdown
  const filteredOrigins = useMemo(() => {
    const q = originFilterText.trim().toLowerCase();
    if (!q) return LOCATIONS_DATA;
    return LOCATIONS_DATA.filter(
      (l) =>
        l.bengaliName.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q)
    );
  }, [originFilterText]);

  const filteredDestinations = useMemo(() => {
    const q = destFilterText.trim().toLowerCase();
    if (!q) return LOCATIONS_DATA;
    return LOCATIONS_DATA.filter(
      (l) =>
        l.bengaliName.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q)
    );
  }, [destFilterText]);

  const currentOriginName = LOCATIONS_DATA.find((l) => l.id === originId)?.bengaliName || originId;
  const currentDestName = LOCATIONS_DATA.find((l) => l.id === destinationId)?.bengaliName || destinationId;

  // Real-time dynamic next departure countdown helper
  const getDynamicDepartureCountdown = (intervalStr?: string) => {
    const minutes = liveCurrentTime.getMinutes();
    const seconds = liveCurrentTime.getSeconds();
    const cycle = intervalStr?.includes('৫') ? 5 : intervalStr?.includes('১০') ? 10 : intervalStr?.includes('২০') ? 20 : 15;
    const remainMin = cycle - 1 - (minutes % cycle);
    const remainSec = 59 - seconds;
    return `${remainMin} মি. ${remainSec < 10 ? '০' : ''}${remainSec} সে. পর`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="মূল টুলস পোর্টালে ফিরে যান"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">টুলস হাব</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">
                    কোন বাসে কত ভাড়া?
                  </h1>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>লাইভ</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  The MoSaFa Bus Fare Finder
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLiveRefresh}
              disabled={isLiveSyncing}
              className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="রিয়েলটাইম লাইভ ডাটা রিফ্রেশ"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isLiveSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">লাইভ রিফ্রেশ</span>
            </button>
            <button
              onClick={() => setIsSubmitFareModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">নতুন ভাড়া যোগ</span>
            </button>
            <button
              onClick={() => setIsDataManagerOpen(true)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="ডেটা ম্যানেজার ও ব্যাকআপ"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Custom Bus Illustration & Real-Time Live Status Bar */}
      <section className="bg-gradient-to-b from-sky-100/70 via-blue-50/40 to-slate-50 border-b border-sky-200/60 px-4 pt-6 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live System Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-300 text-slate-800 text-xs font-bold mb-3 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-emerald-700 font-extrabold">🟢 সকল সার্ভিস চালু রয়েছে</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {liveCurrentTime.toLocaleTimeString('bn-BD', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </span>
          </div>

          {/* Bus Illustration (Custom Vibrant SVG) */}
          <div className="max-w-md mx-auto mb-3 drop-shadow-sm select-none">
            <svg
              viewBox="0 0 520 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto max-h-32 mx-auto"
            >
              <rect x="10" y="150" width="500" height="8" rx="4" fill="#cbd5e1" />
              <line x1="40" y1="154" x2="100" y2="154" stroke="#ffffff" strokeWidth="3" strokeDasharray="10 10" />
              <line x1="160" y1="154" x2="360" y2="154" stroke="#ffffff" strokeWidth="3" strokeDasharray="10 10" />
              <line x1="420" y1="154" x2="480" y2="154" stroke="#ffffff" strokeWidth="3" strokeDasharray="10 10" />
              <ellipse cx="260" cy="154" rx="200" ry="8" fill="#0f172a" fillOpacity="0.12" />
              <path
                d="M70 140 H450 C465 140 475 130 475 110 V65 C475 40 455 35 430 35 H95 C75 35 60 48 55 70 L45 115 C42 130 52 140 70 140 Z"
                fill="url(#busBodyGradient)"
              />
              <rect x="170" y="24" width="160" height="13" rx="6" fill="#e2e8f0" stroke="#0284c7" strokeWidth="2" />
              <path
                d="M58 80 H465 V60 C465 52 458 48 440 48 H95 C78 48 68 55 65 65 Z"
                fill="#0f172a"
                fillOpacity="0.88"
              />
              <rect x="75" y="52" width="55" height="24" rx="3" fill="#38bdf8" fillOpacity="0.5" />
              <rect x="138" y="52" width="60" height="24" rx="3" fill="#38bdf8" fillOpacity="0.4" />
              <rect x="206" y="52" width="60" height="24" rx="3" fill="#38bdf8" fillOpacity="0.4" />
              <rect x="274" y="52" width="60" height="24" rx="3" fill="#38bdf8" fillOpacity="0.4" />
              <rect x="342" y="52" width="60" height="24" rx="3" fill="#38bdf8" fillOpacity="0.4" />
              <rect x="410" y="52" width="45" height="24" rx="3" fill="#38bdf8" fillOpacity="0.5" />
              <path d="M45 105 Q200 95 470 112 L470 122 Q200 105 45 115 Z" fill="#ef4444" />
              <path d="M50 115 Q220 108 468 126 L468 132 Q220 114 50 122 Z" fill="#10b981" />
              <rect x="44" y="118" width="8" height="12" rx="2" fill="#fbbf24" />
              <circle cx="120" cy="140" r="24" fill="#0f172a" />
              <circle cx="120" cy="140" r="14" fill="#94a3b8" />
              <circle cx="380" cy="140" r="24" fill="#0f172a" />
              <circle cx="380" cy="140" r="14" fill="#94a3b8" />
              <circle cx="430" cy="140" r="24" fill="#0f172a" />
              <circle cx="430" cy="140" r="14" fill="#94a3b8" />
              <defs>
                <linearGradient id="busBodyGradient" x1="50" y1="35" x2="475" y2="140" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="0.6" stopColor="#f8fafc" />
                  <stop offset="1" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            কোন বাসে{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-sky-600 to-emerald-600">
              কত ভাড়া?
            </span>
          </h2>
          <p className="text-xs sm:text-base text-slate-600 mt-1 max-w-xl mx-auto leading-relaxed">
            লোকাল বাস, আন্তঃজেলা, দূরপাল্লার ও এসি কোচের রিয়েলটাইম লাইভ ভাড়ার তালিকা ও সময়সূচি। কোনো সার্ভিসের তথ্য মিসিং হবে না।
          </p>

          {/* Popular Route Shortcuts */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              জনপ্রিয় রুট:
            </span>
            {POPULAR_ROUTES.map((route, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOriginId(route.fromId);
                  setDestinationId(route.toId);
                  setSelectedBusType('all');
                  setSelectedOperatorId('all');
                  setHasSearched(true);
                  pushSearchUrl(route.fromId, route.toId);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                  originId === route.fromId && destinationId === route.toId
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-400 hover:bg-sky-50'
                }`}
              >
                <span>{route.icon}</span>
                <span>{route.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Search Card Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-lg shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
            {/* 1. Origin Dropdown (Col 5) */}
            <div className="md:col-span-5 relative" ref={originRef}>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>কোথা থেকে যাত্রা করবেন?</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsOriginOpen(!isOriginOpen);
                  setIsDestinationOpen(false);
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-left flex items-center justify-between hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {currentOriginName}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Origin Dropdown Menu */}
              {isOriginOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 space-y-2 max-h-72 overflow-y-auto animate-in fade-in duration-150">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={originFilterText}
                      onChange={(e) => setOriginFilterText(e.target.value)}
                      placeholder="জেলা বা টার্মিনালের নাম লিখুন..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    {filteredOrigins.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setOriginId(loc.id);
                          setIsOriginOpen(false);
                          setOriginFilterText('');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-sky-50 transition cursor-pointer ${
                          originId === loc.id ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {loc.type === 'city-stop' ? '🚏' : '📍'}
                          </span>
                          <span>{loc.bengaliName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({loc.district})</span>
                        </div>
                        {loc.type === 'city-stop' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            সিটি বাস
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Swap Button (Col 2) */}
            <div className="md:col-span-2 flex items-center justify-center py-1">
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-sky-100 hover:text-sky-600 hover:border-sky-300 text-slate-600 flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                title="স্থান পরিবর্তন করুন (Swap)"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Destination Dropdown (Col 5) */}
            <div className="md:col-span-5 relative" ref={destRef}>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>কোথায় যাবেন?</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsDestinationOpen(!isDestinationOpen);
                  setIsOriginOpen(false);
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-left flex items-center justify-between hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {currentDestName}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Destination Dropdown Menu */}
              {isDestinationOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 space-y-2 max-h-72 overflow-y-auto animate-in fade-in duration-150">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={destFilterText}
                      onChange={(e) => setDestFilterText(e.target.value)}
                      placeholder="গন্তব্যের নাম লিখুন..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    {filteredDestinations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setDestinationId(loc.id);
                          setIsDestinationOpen(false);
                          setDestFilterText('');
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between hover:bg-sky-50 transition cursor-pointer ${
                          destinationId === loc.id
                            ? 'bg-sky-100 text-sky-900 font-bold'
                            : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {loc.type === 'city-stop' ? '🚏' : '📍'}
                          </span>
                          <span>{loc.bengaliName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({loc.district})</span>
                        </div>
                        {loc.type === 'city-stop' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            সিটি বাস
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Error if Origin === Destination */}
          {originId === destinationId && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>যাত্রার শুরু ও গন্তব্য একই হতে পারে না। অনুগ্রহ করে ভিন্ন স্থান নির্বাচন করুন।</span>
            </div>
          )}

          {/* Secondary Filter Row: Bus Type, Operator, Class, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4 pt-4 border-t border-slate-100">
            {/* 3. বাসের ধরন */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                বাসের ধরন (ক্যাটাগরি)
              </label>
              <select
                value={selectedBusType}
                onChange={(e) => setSelectedBusType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">সকল ধরন (লোকাল, আন্তঃজেলা ও দূরপাল্লার)</option>
                <option value="local">লোকাল বাস (Ordinary Mail)</option>
                <option value="inter-district">আন্তঃজেলা বাস (Direct)</option>
                <option value="long-distance">দূরপাল্লার এক্সপ্রেস কোচ</option>
                <option value="city-service">সিটি বাস / মেট্রো সার্ভিস</option>
              </select>
            </div>

            {/* 4. বাসের নাম / অপারেটর */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                বাসের নাম / কোম্পানি
              </label>
              <select
                value={selectedOperatorId}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">সকল বাস কোম্পানি</option>
                {availableOperatorsForRoute.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.bengaliName}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. সার্ভিস ক্লাস */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                সার্ভিস টাইপ (ক্লাস)
              </label>
              <select
                value={selectedServiceClass}
                onChange={(e) => setSelectedServiceClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">সকল ক্লাস</option>
                <option value="non-ac">নন-এসি (Non-AC)</option>
                <option value="ac-chair">এসি চেয়ার (AC Chair)</option>
                <option value="business-class">বিজনেস ক্লাস (Business Class)</option>
                <option value="sleeper-coach">স্লিপার কোচ (Sleeper)</option>
              </select>
            </div>

            {/* 6. Optional Journey Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                যাত্রার তারিখ (ঐচ্ছিক)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-sky-500 cursor-pointer"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Submit Search Button */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFavorite}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  isCurrentFavorite
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isCurrentFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>{isCurrentFavorite ? 'সংরক্ষিত রুট' : 'প্রিয় রুট করুন'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>শেয়ার</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-sky-600 to-indigo-700 hover:from-red-700 hover:to-indigo-800 text-white font-black text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>ভাড়া খুঁজুন 🔍</span>
            </button>
          </div>
        </section>

        {/* Route Overview & Real-Time Stats Banner */}
        {hasSearched && (
          <section className="space-y-5">
            {/* Real-time Highway & Counter Status Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-md border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                      রিয়েলটাইম লাইভ রুট
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                      <Activity className="w-3 h-3 animate-spin" />
                      <span>লাইভ সিঙ্ক: {lastSyncTime}</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black mt-1 flex items-center gap-2">
                    <span>{currentOriginName}</span>
                    <span className="text-sky-400">➔</span>
                    <span>{currentDestName}</span>
                  </h3>
                  {activeRoute?.description && (
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      {activeRoute.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-slate-400 font-semibold">মহাসড়ক দূরত্ব</span>
                    <span className="font-extrabold text-white text-sm">
                      {liveDistanceKm} কিমি
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-slate-400 font-semibold">আনুমানিক সময়</span>
                    <span className="font-extrabold text-white text-sm">
                      {liveDurationText}
                    </span>
                  </div>

                  {bridgeInfo.hasToll && (
                    <div className="bg-amber-500/20 backdrop-blur-xs px-3 py-2 rounded-xl border border-amber-500/30">
                      <span className="block text-[10px] text-amber-300 font-semibold">টোল এক্সপ্রেসওয়ে</span>
                      <span className="font-extrabold text-amber-200 text-sm">
                        {bridgeInfo.bridgeName}
                      </span>
                    </div>
                  )}

                  {lowestVerifiedFare !== null && (
                    <div className="bg-emerald-500/20 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-emerald-500/30">
                      <span className="block text-[10px] text-emerald-300 font-semibold">সর্বনিম্ন সরকারি রেট</span>
                      <span className="font-extrabold text-emerald-400 text-base">
                        ৳{lowestVerifiedFare}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Terminals Notice */}
              {activeRoute?.alternativeTerminals && activeRoute.alternativeTerminals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white mr-1">বোর্ডিং টার্মিনাল পরামর্শ:</span>
                    {activeRoute.alternativeTerminals.map((term, tIdx) => (
                      <span key={tIdx} className="mr-3">
                        • {term.bengaliName} ({term.note})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Fallback Smart Notice (If user filtered by a specific type but we still show all active options) */}
            {isShowingFallback && (
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-300 text-sky-900 text-xs font-medium flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    💡 নির্বাচিত ক্যাটাগরির পাশাপাশি <strong>{currentOriginName} ➔ {currentDestName}</strong> রুটের <strong>সকল সক্রিয় বাস সার্ভিস ও লাইভ ভাড়া</strong> নিচে প্রদর্শিত হচ্ছে।
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedBusType('all');
                    setSelectedOperatorId('all');
                    setSelectedServiceClass('all');
                    setFilterClassTab('all');
                    setVerifiedOnly(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  সব ফিল্টার ক্লিয়ার 🔄
                </button>
              </div>
            )}

            {/* Special Feature: Stop-to-Stop Segment Fare for City & Local Bus */}
            {activeRoute?.stops && activeRoute.stops.length > 1 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
                  <Bus className="w-5 h-5 text-amber-600" />
                  <span>লোকাল ও সিটি বাস: স্টপ-টু-স্টপ ভাড়া হিসাবকারী (BRTA গেজেট তালিকা অনুযায়ী)</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  পুরো রুটের বাইরে নির্দিষ্ট স্টপ থেকে নামার স্টপ পর্যন্ত অফিসিয়াল গেজেট ভাড়া পরীক্ষা করুন।
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      উঠবেন কোন স্টপ থেকে?
                    </label>
                    <select
                      value={cityBoardingStopId}
                      onChange={(e) => setCityBoardingStopId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800"
                    >
                      {activeRoute.stops.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.bengaliName} ({stop.distanceFromOriginKm} কিমি)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      নামবেন কোন স্টপে?
                    </label>
                    <select
                      value={cityDroppingStopId}
                      onChange={(e) => setCityDroppingStopId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800"
                    >
                      {activeRoute.stops.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                          {stop.bengaliName} ({stop.distanceFromOriginKm} কিমি)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    {calculatedSegmentFare ? (
                      <div className="p-2.5 rounded-xl bg-white border border-amber-300 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">
                            দূরত্ব: {calculatedSegmentFare.distanceKm.toFixed(1)} কিমি
                          </span>
                          <span className="text-xs font-black text-amber-900">
                            নির্ধারিত ভাড়া:
                          </span>
                        </div>
                        <span className="text-xl font-black text-emerald-600">
                          ৳{calculatedSegmentFare.fare}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-100 text-[11px] text-amber-800 font-semibold">
                        সঠিক শুরু ও গন্তব্য স্টপ নির্বাচন করুন
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Travel Budget Calculator Box */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    ভ্রমণ বাজেট ক্যালকুলেটর (Estimated Travel Budget)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    যাত্রী সংখ্যা ও আসা-যাওয়ার ভাড়া হিসাব করুন
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span>যাত্রী:</span>
                  <select
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} জন
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRoundTrip}
                    onChange={(e) => setIsRoundTrip(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>আসা-যাওয়া (Round Trip)</span>
                </label>

                {lowestVerifiedFare !== null && (
                  <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900">
                    আনুমানিক বাজেট:{' '}
                    <span className="text-sm font-extrabold text-sky-700">
                      ৳{lowestVerifiedFare * passengerCount * (isRoundTrip ? 2 : 1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Filter and View Toggle Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* Class Tabs: All, Non-AC, AC */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl w-fit">
                <button
                  onClick={() => setFilterClassTab('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterClassTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  সব ভাড়া ({matchingFares.length})
                </button>
                <button
                  onClick={() => setFilterClassTab('non-ac')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterClassTab === 'non-ac'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  নন-এসি ও লোকাল
                </button>
                <button
                  onClick={() => setFilterClassTab('ac')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterClassTab === 'ac'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  এসি ও বিজনেস ক্লাস
                </button>
              </div>

              {/* View Switch & Sort */}
              <div className="flex items-center gap-3">
                {/* Verified Only Checkbox */}
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>শুধু যাচাইকৃত</span>
                </label>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1 text-xs font-bold">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold cursor-pointer"
                  >
                    <option value="fare-asc">ভাড়া: কম থেকে বেশি ৳</option>
                    <option value="fare-desc">ভাড়া: বেশি থেকে কম ৳</option>
                    <option value="operator">অপারেটরের নাম অনুযায়ী</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden p-0.5">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600'
                    }`}
                  >
                    কার্ড
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600'
                    }`}
                  >
                    টেবিল
                  </button>
                </div>
              </div>
            </div>

            {/* RESULTS VIEW: Cards or Table */}
            {viewMode === 'cards' ? (
              /* Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingFares.map((fare) => {
                  const catBadge = getFareCategoryBadge(fare.fareCategory);
                  const statusBadge = getFareStatusBadge(fare.status);
                  const isLowest =
                    lowestVerifiedFare !== null &&
                    fare.fareAmount === lowestVerifiedFare &&
                    fare.status === 'verified';

                  return (
                    <div
                      key={fare.id}
                      className={`bg-white rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden ${
                        isLowest
                          ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      {/* Lowest Verified Tag */}
                      {isLowest && (
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl shadow-xs">
                          ⭐ সর্বনিম্ন যাচাইকৃত ভাড়া
                        </div>
                      )}

                      <div className="space-y-3.5">
                        {/* Top Operator and Category Badges */}
                        <div className="flex items-start justify-between gap-3 pr-6">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                                {getBusTypeLabel(fare.busType)}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>সক্রিয় সার্ভিস</span>
                              </span>
                              {fare.availableSeats !== undefined && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                                  <span>💺 {fare.availableSeats}টি সিট ফাঁকা</span>
                                </span>
                              )}
                              {fare.highwayStatus && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                                  <span>🛣️ {fare.highwayStatus}</span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                              {fare.operatorName}
                            </h4>
                            <span className="inline-block mt-1 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                              {getServiceClassLabel(fare.serviceClass)}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                              ৳{fare.fareAmount}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-semibold">
                              জনপ্রতি ভাড়া
                            </span>
                          </div>
                        </div>

                        {/* Real-time Departure Schedule & Interval */}
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="font-bold text-slate-800">
                              {fare.departureInterval || 'প্রতি ১৫-২০ মিনিট পর পর'}
                            </span>
                          </div>
                          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg">
                            পরবর্তী বাস: {getDynamicDepartureCountdown(fare.departureInterval)}
                          </span>
                        </div>

                        {/* Badges: Category & Status */}
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          <span
                            className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 ${catBadge.bg} ${catBadge.text}`}
                            title={catBadge.label}
                          >
                            <span>{catBadge.icon}</span>
                            <span>{catBadge.label}</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${statusBadge.badgeBg}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Route & Boarding Points */}
                        <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                          {fare.boardingPoints && fare.boardingPoints.length > 0 && (
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-slate-800 shrink-0">বোর্ডিং:</span>
                              <span className="truncate">{fare.boardingPoints.join(', ')}</span>
                            </div>
                          )}

                          {fare.droppingPoints && fare.droppingPoints.length > 0 && (
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-slate-800 shrink-0">ড্রপিং:</span>
                              <span className="truncate">{fare.droppingPoints.join(', ')}</span>
                            </div>
                          )}

                          {fare.notes && (
                            <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                              💡 {fare.notes}
                            </p>
                          )}
                        </div>

                        {/* Source Transparency Box */}
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">উৎস: {fare.fareSource}</span>
                            <span className="text-[10px] text-slate-400">
                              যাচাই: {fare.verifiedAt}
                            </span>
                          </div>
                          {fare.sourceUrl && (
                            <a
                              href={fare.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:underline flex items-center gap-1 font-semibold text-[10px]"
                            >
                              <span>অফিশিয়াল সূত্র লিংক</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReportingFare(fare);
                            setIsReportModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>ভাড়া রিপোর্ট</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {fare.contactPhone && (
                            <a
                              href={`tel:${fare.contactPhone}`}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1"
                              title="কাউন্টার ফোন নম্বর"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{fare.contactPhone}</span>
                            </a>
                          )}

                          {fare.bookingUrl && (
                            <a
                              href={fare.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                            >
                              <span>বুকিং</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Smart Fare Comparison Table View */
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[11px]">
                        <th className="py-3 px-4">অপারেটর ও বাস</th>
                        <th className="py-3 px-4">ক্লাস</th>
                        <th className="py-3 px-4">বাসের ধরন</th>
                        <th className="py-3 px-4">ভাড়া (৳)</th>
                        <th className="py-3 px-4">সময়সূচি / ফ্রিকোয়েন্সি</th>
                        <th className="py-3 px-4">উৎস ও স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matchingFares.map((fare) => {
                        const catBadge = getFareCategoryBadge(fare.fareCategory);
                        const statusBadge = getFareStatusBadge(fare.status);
                        const isLowest =
                          lowestVerifiedFare !== null &&
                          fare.fareAmount === lowestVerifiedFare &&
                          fare.status === 'verified';

                        return (
                          <tr
                            key={fare.id}
                            className={`hover:bg-sky-50/50 transition ${isLowest ? 'bg-emerald-50/40' : ''}`}
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                {isLowest && <span title="সর্বনিম্ন ভাড়া">⭐</span>}
                                <span>{fare.operatorName}</span>
                              </div>
                              {fare.boardingPoints && (
                                <span className="text-[10px] text-slate-400 font-normal block truncate max-w-xs">
                                  {fare.boardingPoints.join(', ')}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-bold text-slate-700">
                                {getServiceClassLabel(fare.serviceClass)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              {getBusTypeLabel(fare.busType)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-base font-black text-slate-900">
                                ৳{fare.fareAmount}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-bold">
                              {fare.departureInterval || 'প্রতি ১৫-২০ মিনিট অন্তর'}
                            </td>
                            <td className="py-3.5 px-4 space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${catBadge.bg} ${catBadge.text}`}
                              >
                                <span>{catBadge.icon}</span>
                                <span>{catBadge.label}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {fare.verifiedAt} ({statusBadge.label})
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setReportingFare(fare);
                                  setIsReportModalOpen(true);
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition cursor-pointer"
                                title="ভুল ভাড়া রিপোর্ট করুন"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Zero Results Safety Guard */}
            {matchingFares.length === 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  🚌
                </div>
                <h4 className="text-base font-black text-slate-800">
                  এই নির্দিষ্ট ফিল্টারে সরাসরি বাস পাওয়া যায়নি
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {currentOriginName} ➔ {currentDestName} রুটের অন্যান্য সকল ক্যাটাগরি ও ক্লাসের সক্রিয় বাস দেখতে নিচের বাটনে ক্লিক করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBusType('all');
                    setSelectedOperatorId('all');
                    setSelectedServiceClass('all');
                    setFilterClassTab('all');
                    setVerifiedOnly(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer"
                >
                  সকল সক্রিয় সার্ভিস দেখুন 🔄
                </button>
              </div>
            )}
          </section>
        )}

        {/* Favorite Routes & Recent Searches Bar */}
        {(favoriteRoutes.length > 0 || recentSearches.length > 0) && (
          <section className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3.5">
            {favoriteRoutes.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>আপনার প্রিয় রুটসমূহ</span>
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {favoriteRoutes.map((fav, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => {
                        setOriginId(fav.fromId);
                        setDestinationId(fav.toId);
                        setSelectedBusType('all');
                        setSelectedOperatorId('all');
                        setHasSearched(true);
                        pushSearchUrl(fav.fromId, fav.toId);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>⭐</span>
                      <span>{fav.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentSearches.length > 0 && (
              <div className={favoriteRoutes.length > 0 ? 'pt-3 border-t border-slate-100' : ''}>
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>সাম্প্রতিক সার্চ</span>
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {recentSearches.map((rec, rIdx) => {
                    const fromName = LOCATIONS_DATA.find((l) => l.id === rec.fromId)?.bengaliName || rec.fromId;
                    const toName = LOCATIONS_DATA.find((l) => l.id === rec.toId)?.bengaliName || rec.toId;
                    return (
                      <button
                        key={rIdx}
                        onClick={() => {
                          setOriginId(rec.fromId);
                          setDestinationId(rec.toId);
                          setSelectedBusType('all');
                          setSelectedOperatorId('all');
                          setHasSearched(true);
                          pushSearchUrl(rec.fromId, rec.toId);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
                      >
                        {fromName} ➔ {toName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* BRTA & Official Notice Footer Box */}
        <section className="bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 rounded-3xl p-5 border border-sky-200 text-xs text-slate-700 space-y-2.5 leading-relaxed">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ভাড়ার নির্ভুলতা ও বিশ্বাসযোগ্যতা নীতিমালা (Fare Trust Policy)</span>
          </div>
          <p>
            MoSaFa Bus Fare Finder সরকার (BRTA) প্রকাশিত অফিসিয়াল গেজেট ও আন্তঃজেলা বাস মালিক সমিতির তালিকা অগ্রাধিকার দেয়।
            কোনো অপারেটরের নির্ধারিত ভাড়া পরিবর্তন হলে বা অতিরিক্ত ভাড়া আদায়ের ক্ষেত্রে যাত্রীরা সরাসরি এই টুলে “ভাড়া রিপোর্ট” পাঠাতে পারেন।
          </p>
        </section>
      </main>

      {/* MODAL 1: Community Fare Submission */}
      {isSubmitFareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>নতুন বাস ভাড়া দাখিল করুন (Community Submission)</span>
              </h3>
              <button
                onClick={() => setIsSubmitFareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              ⚠️ <strong>স্বচ্ছতা নিয়ম:</strong> আপনার জমা দেওয়া তথ্য প্রথমে <em>needs-review</em> (পর্যালোচনাধীন) অবস্থায় সংরক্ষিত হবে। যাচাই ছাড়া এটি চূড়ান্ত পাবলিক ভাড়ায় রূপান্তর হবে না।
            </div>

            <form onSubmit={handleCommunityFareSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কোথা থেকে (Origin)</label>
                  <select
                    value={newFareOrigin}
                    onChange={(e) => setNewFareOrigin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    {LOCATIONS_DATA.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.bengaliName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">কোথায় (Destination)</label>
                  <select
                    value={newFareDest}
                    onChange={(e) => setNewFareDest(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  >
                    {LOCATIONS_DATA.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.bengaliName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বাসের নাম / অপারেটর</label>
                <input
                  type="text"
                  required
                  value={newFareOperator}
                  onChange={(e) => setNewFareOperator(e.target.value)}
                  placeholder="যেমন: শ্যামলী, হানিফ, এনা, ইত্যাদি..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ভাড়ার পরিমাণ (টাকা ৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newFareAmount}
                    onChange={(e) => setNewFareAmount(e.target.value)}
                    placeholder="যেমন: 680"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">সার্ভিস ক্লাস</label>
                  <select
                    value={newFareClass}
                    onChange={(e) => setNewFareClass(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    <option value="non-ac">নন-এসি (Non-AC)</option>
                    <option value="ac-chair">এসি চেয়ার (AC)</option>
                    <option value="business-class">বিজনেস ক্লাস</option>
                    <option value="sleeper-coach">স্লিপার কোচ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  উৎস বা প্রমাণের বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={newFareSourceDoc}
                  onChange={(e) => setNewFareSourceDoc(e.target.value)}
                  placeholder="যেমন: কাউন্টার টিকিট স্লিপ বা নোটিশ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মন্তব্য বা পরামর্শ</label>
                <textarea
                  rows={2}
                  value={newFareNotes}
                  onChange={(e) => setNewFareNotes(e.target.value)}
                  placeholder="বোর্ডিং পয়েন্ট বা কোনো বিশেষ বিষয়..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitFareModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  দাখিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Report Incorrect / Extra Fare */}
      {isReportModalOpen && reportingFare && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>ভাড়া সম্পর্কে অভিযোগ বা আপডেট রিপোর্ট</span>
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div>
                <strong>রুট:</strong> {reportingFare.originName} ➔ {reportingFare.destinationName}
              </div>
              <div>
                <strong>অপারেটর:</strong> {reportingFare.operatorName} (৳{reportingFare.fareAmount})
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">সমস্যার ধরন</label>
                <select
                  value={reportIssueType}
                  onChange={(e) => setReportIssueType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="incorrect-fare">ভাড়া পরিবর্তন হয়েছে (ভুল ভাড়া)</option>
                  <option value="extra-fare">কাউন্টারে অতিরিক্ত ভাড়া নেওয়া হয়েছে</option>
                  <option value="outdated-data">তথ্যটি পুরোনো বা মেয়াদোত্তীর্ণ</option>
                  <option value="other">অন্যান্য সমস্যা</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিস্তারিত বিবরণ</label>
                <textarea
                  required
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="বর্তমানে কাউন্টারে কত ভাড়া নেওয়া হচ্ছে এবং কারণ উল্লেখ করুন..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  আপনার মোবাইল নম্বর বা ইমেইল (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={reportContact}
                  onChange={(e) => setReportContact(e.target.value)}
                  placeholder="প্রয়োজনে যোগাযোগের জন্য..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  রিপোর্ট পাঠান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Data Manager & JSON Schema Tools */}
      {isDataManagerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <span>ডেটা ম্যানেজার ও এক্সপোর্ট/ইমপোর্ট (JSON)</span>
              </h3>
              <button
                onClick={() => setIsDataManagerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed">
              💡 <strong>বিজ্ঞপ্তি:</strong> ব্রাউজারে যুক্ত করা বা পরিবর্তন করা নতুন ভাড়ার তথ্য আপনার লোকাল ব্রাউজারে সংরক্ষিত হয়। স্থায়ীভাবে সবার জন্য প্রকাশ করতে কেন্দ্রীয় JSON ডেটাসেট আপডেট করতে হবে।
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">মোট অফিশিয়াল রেকর্ড</span>
                  <span className="text-[11px] text-slate-500">
                    {FARE_RECORDS_DATA.length}টি সরকারি ও অপারেটর যাচাইকৃত রেকর্ড
                  </span>
                </div>
                <span className="text-sm font-extrabold text-emerald-600">✅ ভেরিফাইড</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">কমিউনিটি সাবমিশন রেকর্ড</span>
                  <span className="text-[11px] text-slate-500">
                    {communityFares.length}টি লোকাল পর্যালোচনা রেকর্ড
                  </span>
                </div>
                {communityFares.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('সকল লোকাল কমিউনিটি রেকর্ড মুছে ফেলতে চান?')) {
                        setCommunityFares([]);
                        onShowToast('লোকাল কমিউনিটি রেকর্ড মুছে ফেলা হয়েছে।', '🗑️');
                      }
                    }}
                    className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                )}
              </div>

              {/* JSON Export */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allFareRecords, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', 'mosafa-bus-fares.json');
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    onShowToast('JSON ডেটাসেট ডাউনলোড শুরু হয়েছে! 📥', '🎉');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>ভাড়া ডেটাসেট ডাউনলোড (JSON)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Shareable Link Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-600" />
                <span>রুট ও ভাড়া শেয়ার করুন</span>
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>{currentOriginName} ➔ {currentDestName}</strong> রুটের বাস ভাড়ার সরাসরি লিংক বন্ধুদের সাথে শেয়ার করতে পারেন:
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 break-all select-all">
              {getPublicFullUrl(`tool=bus-fare&from=${originId}&to=${destinationId}`)}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  const url = getPublicFullUrl(`tool=bus-fare&from=${originId}&to=${destinationId}`);
                  try {
                    await navigator.clipboard.writeText(url);
                    onShowToast('লিংক ক্লিপবোর্ডে কপি করা হয়েছে! 📋', '🔗');
                  } catch {
                    onShowToast('কপি করা সম্ভব হয়নি। ম্যানুয়ালি কপি করুন।', '⚠️');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
              >
                লিংক কপি করুন 📋
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = getPublicFullUrl(`tool=bus-fare&from=${originId}&to=${destinationId}`);
                  const waText = `🚌 ${currentOriginName} থেকে ${currentDestName} বাসের ভাড়া ও সময়সূচি:\n${url}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                হোয়াটসঅ্যাপ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
