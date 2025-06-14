// NotificationService.js
// Giả lập notification cho consultant

class NotificationService {
  static listeners = [];

  static subscribe(listener) {
    NotificationService.listeners.push(listener);
    return () => {
      NotificationService.listeners = NotificationService.listeners.filter(l => l !== listener);
    };
  }

  static notify(type, message, description) {
    NotificationService.listeners.forEach(listener => listener({ type, message, description }));
  }

  // Các loại notification mẫu
  static newRequest(request) {
    NotificationService.notify('info', 'Yêu cầu tư vấn mới', `Khách hàng ${request.client} đã gửi yêu cầu tư vấn về "${request.topic}".`);
  }

  static requestApproved(request) {
    NotificationService.notify('success', 'Yêu cầu đã được duyệt', `Yêu cầu tư vấn của khách hàng ${request.client} đã được duyệt.`);
  }

  static requestDenied(request) {
    NotificationService.notify('warning', 'Yêu cầu bị từ chối', `Yêu cầu tư vấn của khách hàng ${request.client} đã bị từ chối.`);
  }

  static meetingSoon(consultation) {
    NotificationService.notify('info', 'Sắp đến giờ tư vấn', `Bạn có buổi tư vấn với ${consultation.client} lúc ${consultation.time}.`);
  }

  static requestCanceled(request) {
    NotificationService.notify('error', 'Yêu cầu bị hủy', `Yêu cầu tư vấn của khách hàng ${request.client} đã bị hủy.`);
  }
}

export default NotificationService; 