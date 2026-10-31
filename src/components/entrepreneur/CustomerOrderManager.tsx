import React, { useState } from 'react';
import {
  Users,
  ShoppingBag,
  Plus,
  Search,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Trash2,
  DollarSign,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { BusinessProject, CustomerLead, OrderRecord } from '../../types/entrepreneur';

interface CustomerOrderManagerProps {
  project: BusinessProject;
  onUpdateProject: (updater: (prev: BusinessProject) => BusinessProject) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const CustomerOrderManager: React.FC<CustomerOrderManagerProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'orders'>('leads');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // New Lead State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadDistrict, setLeadDistrict] = useState('ঢাকা');
  const [leadStatus, setLeadStatus] = useState<CustomerLead['status']>('lead');
  const [leadSource, setLeadSource] = useState<CustomerLead['source']>('facebook_group');
  const [leadProduct, setLeadProduct] = useState('');
  const [leadValue, setLeadValue] = useState(3000);
  const [leadNotes, setLeadNotes] = useState('');

  // New Order State
  const [orderCustomerName, setOrderCustomerName] = useState('');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderItems, setOrderItems] = useState('');
  const [orderTotal, setOrderTotal] = useState(3500);
  const [orderAdvance, setOrderAdvance] = useState(1500);
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<OrderRecord['paymentStatus']>('partial');
  const [orderDeliveryStatus, setOrderDeliveryStatus] = useState<OrderRecord['deliveryStatus']>('pending');

  const filteredLeads = project.leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phoneOrWhatsApp.includes(searchQuery) ||
      l.interestedInProduct.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = project.orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLead = () => {
    if (!leadName.trim()) {
      onShowToast('অনুগ্রহ করে কাস্টমারের নাম লিখুন!', '⚠️');
      return;
    }
    const newLead: CustomerLead = {
      id: `lead-${Date.now()}`,
      name: leadName.trim(),
      phoneOrWhatsApp: leadPhone.trim(),
      district: leadDistrict,
      status: leadStatus,
      source: leadSource,
      interestedInProduct: leadProduct || 'স্ট্যান্ডার্ড প্যাকেজ',
      potentialValueBDT: Number(leadValue) || 0,
      notes: leadNotes,
      createdAt: new Date().toISOString(),
    };

    onUpdateProject((prev) => ({
      ...prev,
      leads: [newLead, ...prev.leads],
      updatedAt: new Date().toISOString(),
    }));

    setIsAddLeadOpen(false);
    setLeadName('');
    setLeadPhone('');
    setLeadNotes('');
    onShowToast('নতুন কাস্টমার লিড সফলভাবে সংরক্ষিত হয়েছে! 👤', '✅');
  };

  const handleAddOrder = () => {
    if (!orderCustomerName.trim()) {
      onShowToast('অনুগ্রহ করে গ্রাহকের নাম লিখুন!', '⚠️');
      return;
    }

    const total = Number(orderTotal) || 0;
    const advance = Number(orderAdvance) || 0;
    const due = Math.max(0, total - advance);

    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      customerName: orderCustomerName.trim(),
      customerPhone: orderCustomerPhone.trim(),
      customerAddress: orderAddress.trim(),
      itemsOrdered: orderItems || 'স্ট্যান্ডার্ড সার্ভিস',
      totalAmountBDT: total,
      advancePaidBDT: advance,
      dueAmountBDT: due,
      paymentStatus: due === 0 ? 'paid' : advance > 0 ? 'partial' : 'unpaid',
      deliveryStatus: orderDeliveryStatus,
      orderDate: new Date().toISOString().split('T')[0],
    };

    onUpdateProject((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      updatedAt: new Date().toISOString(),
    }));

    setIsAddOrderOpen(false);
    setOrderCustomerName('');
    setOrderCustomerPhone('');
    setOrderItems('');
    onShowToast('নতুন অর্ডার সফলভাবে রেজিস্ট্রি হয়েছে! 🛍️', '✅');
  };

  const deleteLead = (id: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      leads: prev.leads.filter((l) => l.id !== id),
    }));
    onShowToast('লিড মুছে ফেলা হয়েছে।', '🗑️');
  };

  const deleteOrder = (id: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== id),
    }));
    onShowToast('অর্ডার মুছে ফেলা হয়েছে।', '🗑️');
  };

  const openWhatsAppChat = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let formatted = cleanPhone;
    if (formatted.startsWith('01')) {
      formatted = '8801' + formatted.slice(2);
    }
    const msg = encodeURIComponent(`আসসালামু আলাইকুম ${name} ভাইয়া/আপু, আপনার অর্ডার/সার্ভিস বিষয়ে যোগাযোগ করছি...`);
    window.open(`https://wa.me/${formatted}?text=${msg}`, '_blank');
  };

  // Status badges
  const leadStatusBadge: Record<CustomerLead['status'], { label: string; color: string }> = {
    lead: { label: 'নতুন লিড', color: 'bg-slate-100 text-slate-700' },
    contacted: { label: 'যোগাযোগ হয়েছে', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    negotiating: { label: 'কথা চলছে', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    converted: { label: 'কনভার্টেড ক্রেতা', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    lost: { label: 'বাতিল', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>মডিউল ৯: কাস্টমার ও অর্ডার খাতা (Mini CRM)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            গ্রাহকের ফোন নম্বর, অর্ডার ও পেমেন্টের ডিজিটাল হিসাব
          </h2>
          <p className="text-xs text-slate-500">
            কাগজের খাতা হারিয়ে যাওয়ার ভয় নেই। প্রতিটি কাস্টমারের হিস্টোরি ও বাকি টাকা সহজে ট্র্যাক করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'leads' ? (
            <button
              type="button"
              onClick={() => setIsAddLeadOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কাস্টমার / লিড</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddOrderOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন অর্ডার এন্ট্রি</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>কাস্টমার লিড ({project.leads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>অর্ডার খাতা ({project.orders.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tab 1: Leads List */}
      {activeTab === 'leads' && (
        <div className="space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <span className="text-3xl block">👤</span>
              <p className="text-xs text-slate-500 font-bold">কোনো কাস্টমার বা লিড পাওয়া যায়নি।</p>
              <button
                type="button"
                onClick={() => setIsAddLeadOpen(true)}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
              >
                + প্রথম কাস্টমার যুক্ত করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{lead.name}</h4>
                        <span className="text-[11px] text-slate-500">{lead.district} • উৎস: {lead.source}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${leadStatusBadge[lead.status].color}`}>
                        {leadStatusBadge[lead.status].label}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-0.5">
                      <div>
                        <span className="text-slate-400">চাহিদা: </span>
                        <span className="font-medium">{lead.interestedInProduct}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">সম্ভাব্য মূল্য: </span>
                        <span className="font-bold text-emerald-700">৳{lead.potentialValueBDT.toLocaleString('bn-BD')}</span>
                      </div>
                      {lead.notes && (
                        <div className="text-[11px] text-slate-500 pt-1 italic">"{lead.notes}"</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {lead.phoneOrWhatsApp && (
                        <button
                          type="button"
                          onClick={() => openWhatsAppChat(lead.phoneOrWhatsApp, lead.name)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp বার্তা</span>
                        </button>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">{lead.phoneOrWhatsApp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteLead(lead.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-1"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <span className="text-3xl block">🛍️</span>
              <p className="text-xs text-slate-500 font-bold">এখনো কোনো অর্ডার রেকর্ড করা হয়নি।</p>
              <button
                type="button"
                onClick={() => setIsAddOrderOpen(true)}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
              >
                + প্রথম অর্ডার লিখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ord.orderNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{ord.customerName}</h4>
                        <span className="text-[11px] text-slate-500">{ord.customerAddress || 'লোকাল ডেলিভারি'}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {ord.paymentStatus === 'paid' ? 'পরিশোধিত' : 'আংশিক / বাকি'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="font-medium text-slate-800">{ord.itemsOrdered}</div>
                      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">মোট বিল:</span>
                          <span className="font-bold text-slate-900">৳{ord.totalAmountBDT.toLocaleString('bn-BD')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">অগ্রিম:</span>
                          <span className="font-bold text-emerald-700">৳{ord.advancePaidBDT.toLocaleString('bn-BD')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">বাকি:</span>
                          <span className="font-bold text-rose-600">৳{ord.dueAmountBDT.toLocaleString('bn-BD')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">তারিখ: {ord.orderDate}</span>
                    <button
                      type="button"
                      onClick={() => deleteOrder(ord.id)}
                      className="text-slate-300 hover:text-rose-500 transition p-1"
                      title="অর্ডার মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">নতুন কাস্টমার / লিড যুক্ত করুন</h3>
              <button type="button" onClick={() => setIsAddLeadOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">নাম:</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="যেমন: রাশেদ হোসেন"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">মোবাইল / WhatsApp:</label>
                <input
                  type="text"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">স্ট্যাটাস:</label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="lead">নতুন লিড</option>
                    <option value="contacted">যোগাযোগ হয়েছে</option>
                    <option value="negotiating">কথা চলছে</option>
                    <option value="converted">কনভার্টেড</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">সম্ভাব্য মূল্য (৳):</label>
                  <input
                    type="number"
                    value={leadValue}
                    onChange={(e) => setLeadValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddLeadOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAddLead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {isAddOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">নতুন অর্ডার এন্ট্রি করুন</h3>
              <button type="button" onClick={() => setIsAddOrderOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">গ্রাহকের নাম:</label>
                <input
                  type="text"
                  value={orderCustomerName}
                  onChange={(e) => setOrderCustomerName(e.target.value)}
                  placeholder="যেমন: আল-মদিনা স্টোর"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">মোবাইল:</label>
                <input
                  type="text"
                  value={orderCustomerPhone}
                  onChange={(e) => setOrderCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">পণ্য বা সেবার বিবরণ:</label>
                <input
                  type="text"
                  value={orderItems}
                  onChange={(e) => setOrderItems(e.target.value)}
                  placeholder="যেমন: গ্রোথ প্যাকেজ (মাসিক)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">মোট বিল (৳):</label>
                  <input
                    type="number"
                    value={orderTotal}
                    onChange={(e) => setOrderTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">অগ্রিম গ্রহণ (৳):</label>
                  <input
                    type="number"
                    value={orderAdvance}
                    onChange={(e) => setOrderAdvance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOrderOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleAddOrder}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                অর্ডার এন্ট্রি করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
