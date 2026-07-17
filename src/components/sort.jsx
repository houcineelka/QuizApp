import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableItem = ({
  id,
  question,
  questionsLength,
  selectedQuestionId,
  setSelectedQuestionId,
  deleteQuestionBd,duplicateQuestion
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : "none",
    transition: transition || "none",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div>
        <div onClick={() => setSelectedQuestionId(question.id)} className={`flex items-center justify-between px-4 py-4 ${selectedQuestionId === question.id ? 'bg-gray-200 text-white' : 'hover:bg-gray-100'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-5 rounded-lg bg-[#4d4dc4] flex items-center justify-center text-white text-sm font-semibold">
              <img
                    {...listeners} // Attach drag listeners for the icon
                    {...attributes} // Attach accessibility attributes
                className="w-3"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAS0lEQVR4nGNgGAWDAvz//5/p////MVDMSAsLYv4jQDSSONmA7hYwggz+//9/FE2CaOiD/6OpCAtAD6LRVIQfjKYibAA9iEZT0TAGABC+CrsrqvI3AAAAAElFTkSuQmCC"
                alt="drag-icon"
              />
            </div>
            <p
              className="text-xs text-gray-800 cursor-pointer"    
            >
              {question.questionText.split(' ').slice(0, 4).join(' ')}{question.questionText.split(' ').length > 5 ? '...' : ''} 
            </p>
          </div>
          <div className="flex items-center gap-2 justify-center cursor-pointer">
            {questionsLength > 1 && (
                <img
              className="w-4"
              onClick={() => deleteQuestionBd(question.id)}
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABQUlEQVR4nN1VS07DMBCNhChXYRHugHoDPhY3yC6b+D1n6T1wC6r2PrCgqIUtUnao7INGcqXg2nGVtiAYaSQrM/NmPJ55ybJ/LdbaEckbkjMAc5KfonIGMBWb+AwCN8ZcA3gl2fap+BhjLrcGVkodAbhPAXNT7yQ2mWAgeLtOkgK/2gG8FY22yz3o0gt41lqfk3wP9L7RWo8BPHq2t7IsTzYSuGn5BiIAYtNa5wLogefONg7cRIUSzEJV1nV9Jvaqqk7lJqFvgbhJKMFLZAybTrV599y9lRczDz3wqmfWm3XVfZV3/FcHTUDy41daNN3XI5N8+PkxtdaOAuT25JapiS2a+HjfF1GGlTXflSoAXATB90F2AG6zlAjlCisejK69di23qHqRbEtMHMMq4RZhVllGt5BynshfryiK40Hgf0a+AH/ByoKo8BgGAAAAAElFTkSuQmCC"
              alt="delete-icon"
            />
            )}
          

            <img className="w-4" onClick={() => duplicateQuestion(question.id)} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABsUlEQVR4nO2ZPUsDQRCGH7QIxCbYpEhrIVhp4R9IYR+7kOJsbLUSYqFNBJGUKvgf/CKgCCn8EzZaSiBVbAwIBhNZmYPhUJBk90iOeWDg2IPZvDfvHJdZMAzDyDoFoAqcAbdA21PcAUdAKbSARaAJfACjgPEGrIcSsQq8BhagoyOV9y7iPbFRF7gAdoDtQLHi2066Ep/AHpBjxmgmRGyoe/NAGdgHjgPEIbAJ5CcVUUg0tqtEzBrwlFK/dIHKJEKqiWQ5JaKfYuOPgCFQG1fIuUrkGju2k67EF/Ag933HZeKBuRdOcRwhNyrJrqyVEyJ0z4RgCej9Ye9/86gSRLJWV2uuEmnQUHte+RJyotbcJ0oabKk93W/yLuSUdIhMiGAV8Uxk1hLMWp6JzFqCWcszkVlLMGt5JjJrCWatabPWfVb+jzSyIqQkA+WZF4JMxTtZEBJPHJd/ruBAJXVzpzSoqz1bvpJWVNK+zJ1CsgA8qz3dQZAX8jI+jRP35KUQ4lihDryovQbKGd6qMkx59juSB+ad2i+HP6FiICLmCERRZrHXHg9E2ypa0hNe7WQYhsFU8A2vkAEHz+IhcQAAAABJRU5ErkJggg==" alt="clone-figure--v3"></img>
          </div>
        </div>
      </div>
    </div>
  );
};