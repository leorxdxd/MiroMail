// src/components/DesignEditor.js
import React, { useState } from "react";
import { useDrop } from "react-dnd"; // Import react-dnd
import { motion } from "framer-motion"; // Import framer-motion for smooth transitions
import './DesignEditor.css';


const DraggableElement = ({ id, type, left, top, children, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ELEMENT",
    item: { id, left, top, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDelete = () => {
    onDelete(id);
  };

  return (
    <motion.div
      ref={drag}
      className="draggable-element"
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        opacity: isDragging ? 0.5 : 1,
      }}
      animate={{ scale: isDragging ? 0.9 : 1 }}
    >
      {children}
      <button className="delete-btn" onClick={handleDelete}>
        X
      </button>
    </motion.div>
  );
};

const DesignEditor = () => {
  const [elements, setElements] = useState([]);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "ELEMENT",
    drop: (item) => handleDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleDrop = (item) => {
    setElements([
      ...elements,
      {
        id: new Date().getTime(),
        type: item.type,
        left: item.left,
        top: item.top,
      },
    ]);
  };

  const handleDelete = (id) => {
    setElements(elements.filter((element) => element.id !== id));
  };

  return (
    <div
      ref={drop}
      className={`canvas ${isOver ? "drag-over" : ""}`}
      style={{ position: "relative", width: "100%", height: "600px", border: "1px solid #ccc" }}
    >
      {elements.map((el) => (
        <DraggableElement
          key={el.id}
          id={el.id}
          left={el.left}
          top={el.top}
          onDelete={handleDelete}
        >
          {el.type === "image" ? (
            <img src="https://via.placeholder.com/100" alt="img" />
          ) : el.type === "shape" ? (
            <div
              style={{
                width: 100,
                height: 100,
                backgroundColor: "red",
                borderRadius: "10px",
              }}
            ></div>
          ) : (
            <div>Text</div>
          )}
        </DraggableElement>
      ))}
    </div>
  );
};

export default DesignEditor;
